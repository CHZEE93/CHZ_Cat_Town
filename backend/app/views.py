from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import Character, CharacterEquipment, ItemDefinition, ShopProduct, User, Post

def user_view(user: User):
    return {"id": user.id, "email": user.email, "nickname": user.nickname, "bio": user.bio, "createdAt": user.created_at}

def character_view(db: Session, user_id: int):
    character = db.get(Character, user_id)
    equipped = {"head": None, "neck": None, "back": None}
    for row in db.scalars(select(CharacterEquipment).where(CharacterEquipment.user_id == user_id)):
        equipped[row.slot] = row.item_id
    return {"catType": character.cat_type, "scale": character.scale, "version": character.version, "equipped": equipped}

def item_view(item: ItemDefinition):
    return {"id": item.id, "name": item.name, "description": item.description, "slot": item.slot, "assetKey": item.asset_key, "icon": item.icon}

def product_view(product: ShopProduct, item: ItemDefinition):
    return {"id": product.id, "price": product.price, "item": item_view(item)}

def post_view(post: Post, author: User):
    return {"id": post.id, "authorId": author.id, "author": author.nickname, "title": post.title, "body": post.body, "category": post.category, "createdAt": post.created_at, "updatedAt": post.updated_at}
