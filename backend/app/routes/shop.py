from uuid import UUID, uuid4
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Wallet, ShopProduct, ItemDefinition, InventoryItem, Purchase, CoinTransaction
from ..schemas import PurchaseInput
from ..security import require_user
from ..views import product_view
router = APIRouter(tags=["shop"])

@router.get("/shop/products")
def products(db: Session = Depends(get_db)):
    return [product_view(product, item) for product, item in db.execute(select(ShopProduct, ItemDefinition).join(ItemDefinition).where(ShopProduct.active.is_(True)).order_by(ShopProduct.id))]

@router.get("/wallet/me")
def wallet(user: User = Depends(require_user), db: Session = Depends(get_db)):
    return {"balance": db.get(Wallet, user.id).balance}

@router.get("/wallet/me/transactions")
def transactions(user: User = Depends(require_user), db: Session = Depends(get_db)):
    return [{"id": row.id, "amount": row.amount, "reason": row.reason, "createdAt": row.created_at} for row in db.scalars(select(CoinTransaction).where(CoinTransaction.user_id == user.id).order_by(CoinTransaction.id.desc()).limit(50))]

@router.post("/shop/purchases")
def purchase(data: PurchaseInput, idempotency_key: UUID = Header(), user: User = Depends(require_user), db: Session = Depends(get_db)):
    # All purchases for one user lock the wallet first; even concurrent retries serialize.
    wallet = db.scalar(select(Wallet).where(Wallet.user_id == user.id).with_for_update())
    key = str(idempotency_key)
    previous = db.scalar(select(Purchase).where(Purchase.user_id == user.id, Purchase.idempotency_key == key))
    if previous:
        if previous.product_id != data.productId:
            raise HTTPException(409, "같은 구매 요청 번호로 다른 상품을 구매할 수 없습니다.")
        return {"purchaseId": previous.id, "balance": wallet.balance, "replayed": True}
    product = db.scalar(select(ShopProduct).where(ShopProduct.id == data.productId).with_for_update())
    if product is None or not product.active:
        raise HTTPException(404, "판매 중인 상품이 아닙니다.")
    if db.get(InventoryItem, (user.id, product.item_id)):
        raise HTTPException(409, "이미 보유한 아이템입니다.")
    if wallet.balance < product.price:
        raise HTTPException(400, "코인이 부족합니다.")
    order = Purchase(id=str(uuid4()), user_id=user.id, product_id=product.id, price=product.price, idempotency_key=key)
    db.add(order)
    db.flush()
    wallet.balance -= product.price
    db.add_all([InventoryItem(user_id=user.id, item_id=product.item_id), CoinTransaction(user_id=user.id, amount=-product.price, reason="purchase", purchase_id=order.id)])
    db.commit()
    return {"purchaseId": order.id, "balance": wallet.balance, "replayed": False}
