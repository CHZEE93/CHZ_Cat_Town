from sqlalchemy import select
from .database import SessionLocal
from .models import ItemDefinition, ShopProduct
CATALOG = [
    ("straw_hat", "산책 밀짚모자", "햇살 좋은 날의 작은 모자", "head", "👒", 300),
    ("red_ribbon", "딸기 리본", "목에 살짝 두르는 붉은 리본", "neck", "🎀", 200),
    ("tiny_backpack", "작은 산책 가방", "가벼운 발걸음을 위한 초록 가방", "back", "🎒", 450),
]
def seed():
    with SessionLocal() as db:
        for index, (code, name, description, slot, icon, price) in enumerate(CATALOG, 1):
            if db.get(ItemDefinition, code) is None:
                db.add(ItemDefinition(id=code, name=name, description=description, slot=slot, asset_key=code, icon=icon))
                db.flush()
            if db.get(ShopProduct, index) is None:
                db.add(ShopProduct(id=index, item_id=code, price=price, active=True))
        db.commit()
if __name__ == "__main__":
    seed()
