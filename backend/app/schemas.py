from typing import Literal
from pydantic import BaseModel, ConfigDict, EmailStr, Field
CatType = Literal["orange", "calico", "tuxedo", "tabby", "black", "white"]
class Input(BaseModel):
    model_config = ConfigDict(extra="forbid")
class Login(Input):
    email: EmailStr = Field(max_length=254)
    password: str = Field(min_length=10, max_length=128)
class Signup(Login):
    nickname: str = Field(min_length=1, max_length=24, pattern=r"\S")
    catType: CatType = "orange"
class ProfileUpdate(Input):
    nickname: str = Field(min_length=1, max_length=24, pattern=r"\S")
    bio: str = Field(max_length=300)
class Equipment(Input):
    head: str | None = Field(default=None, max_length=40)
    neck: str | None = Field(default=None, max_length=40)
    back: str | None = Field(default=None, max_length=40)
class CharacterUpdate(Input):
    catType: CatType
    equipped: Equipment
    version: int = Field(ge=1)
class PostInput(Input):
    title: str = Field(min_length=1, max_length=120, pattern=r"\S")
    body: str = Field(min_length=1, max_length=10000, pattern=r"\S")
    category: Literal["인사", "일상", "모임"] = "일상"
class PurchaseInput(Input):
    productId: int = Field(gt=0)
