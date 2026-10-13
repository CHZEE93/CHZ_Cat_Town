from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, ForeignKeyConstraint, CheckConstraint, UniqueConstraint, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base

def now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    nickname: Mapped[str] = mapped_column(String(24))
    bio: Mapped[str] = mapped_column(String(300), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class LoginSession(Base):
    __tablename__ = "sessions"
    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    csrf_token: Mapped[str] = mapped_column(String(64))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

class Character(Base):
    __tablename__ = "characters"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    cat_type: Mapped[str] = mapped_column(String(20), default="orange")
    version: Mapped[int] = mapped_column(Integer, default=1)
    __table_args__ = (CheckConstraint("cat_type IN ('orange','calico','tuxedo','tabby','black','white')", name="valid_cat_type"),)

class ItemDefinition(Base):
    __tablename__ = "item_definitions"
    id: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(String(200))
    slot: Mapped[str] = mapped_column(String(10))
    asset_key: Mapped[str] = mapped_column(String(40))
    icon: Mapped[str] = mapped_column(String(12))
    __table_args__ = (CheckConstraint("slot IN ('head','neck','back')", name="valid_item_slot"),)

class ShopProduct(Base):
    __tablename__ = "shop_products"
    id: Mapped[int] = mapped_column(primary_key=True)
    item_id: Mapped[str] = mapped_column(ForeignKey("item_definitions.id"), unique=True)
    price: Mapped[int] = mapped_column(Integer)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    __table_args__ = (CheckConstraint("price > 0", name="positive_price"),)

class InventoryItem(Base):
    __tablename__ = "inventory_items"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    item_id: Mapped[str] = mapped_column(ForeignKey("item_definitions.id"), primary_key=True)
    acquired_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    source: Mapped[str] = mapped_column(String(20), default="purchase")

class CharacterEquipment(Base):
    __tablename__ = "character_equipment"
    user_id: Mapped[int] = mapped_column(ForeignKey("characters.user_id", ondelete="CASCADE"), primary_key=True)
    slot: Mapped[str] = mapped_column(String(10), primary_key=True)
    item_id: Mapped[str] = mapped_column(String(40))
    __table_args__ = (
        ForeignKeyConstraint(["user_id", "item_id"], ["inventory_items.user_id", "inventory_items.item_id"]),
        CheckConstraint("slot IN ('head','neck','back')", name="valid_equipment_slot"),
    )

class Wallet(Base):
    __tablename__ = "wallets"
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    balance: Mapped[int] = mapped_column(Integer, default=0)
    __table_args__ = (CheckConstraint("balance >= 0", name="nonnegative_balance"),)

class Purchase(Base):
    __tablename__ = "purchases"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("shop_products.id"))
    price: Mapped[int] = mapped_column(Integer)
    idempotency_key: Mapped[str] = mapped_column(String(36))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)
    __table_args__ = (UniqueConstraint("user_id", "idempotency_key", name="unique_purchase_request"),)

class CoinTransaction(Base):
    __tablename__ = "coin_transactions"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(30))
    purchase_id: Mapped[str | None] = mapped_column(ForeignKey("purchases.id"), unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now)

class Post(Base):
    __tablename__ = "posts"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(120))
    body: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now, onupdate=now)
    __table_args__ = (CheckConstraint("category IN ('인사','일상','모임')", name="valid_post_category"),)

class AuthRateLimit(Base):
    __tablename__ = "auth_rate_limits"
    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    window: Mapped[int] = mapped_column(Integer)
    count: Mapped[int] = mapped_column(Integer)
