from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, delete
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Character, CharacterEquipment, InventoryItem, ItemDefinition
from ..schemas import ProfileUpdate, CharacterUpdate
from ..security import require_user
from ..views import user_view, character_view, item_view
router = APIRouter(tags=["account"])

@router.get("/users/me")
def profile(user: User = Depends(require_user)):
    return user_view(user)

@router.patch("/users/me")
def update_profile(data: ProfileUpdate, user: User = Depends(require_user), db: Session = Depends(get_db)):
    user.nickname = data.nickname.strip()
    user.bio = data.bio.strip()
    db.commit()
    return user_view(user)

@router.get("/characters/me")
def character(user: User = Depends(require_user), db: Session = Depends(get_db)):
    return character_view(db, user.id)

@router.patch("/characters/me")
def update_character(data: CharacterUpdate, user: User = Depends(require_user), db: Session = Depends(get_db)):
    character = db.scalar(select(Character).where(Character.user_id == user.id).with_for_update())
    if character.version != data.version:
        raise HTTPException(409, "다른 화면에서 외형이 변경되었습니다. 다시 불러와 주세요.")
    for slot, item_id in data.equipped.model_dump().items():
        if item_id is None:
            continue
        item = db.get(ItemDefinition, item_id)
        if item is None or item.slot != slot or db.get(InventoryItem, (user.id, item_id)) is None:
            raise HTTPException(400, "보유한 아이템을 올바른 슬롯에 장착해 주세요.")
    db.execute(delete(CharacterEquipment).where(CharacterEquipment.user_id == user.id))
    for slot, item_id in data.equipped.model_dump().items():
        if item_id:
            db.add(CharacterEquipment(user_id=user.id, slot=slot, item_id=item_id))
    character.cat_type = data.catType
    if data.scale is not None:
        character.scale = data.scale
    character.version += 1
    db.commit()
    return character_view(db, user.id)

@router.get("/inventory/me")
def inventory(user: User = Depends(require_user), db: Session = Depends(get_db)):
    rows = db.execute(select(ItemDefinition).join(InventoryItem, InventoryItem.item_id == ItemDefinition.id).where(InventoryItem.user_id == user.id).order_by(ItemDefinition.id)).scalars()
    return [item_view(item) for item in rows]
