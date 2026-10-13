from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Post
from ..schemas import PostInput
from ..security import require_user
from ..views import post_view
router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("")
def posts(before: int | None = Query(default=None, gt=0), limit: int = Query(default=20, ge=1, le=50), db: Session = Depends(get_db)):
    query = select(Post, User).join(User, User.id == Post.user_id).order_by(Post.id.desc()).limit(limit + 1)
    if before is not None:
        query = query.where(Post.id < before)
    rows = db.execute(query).all()
    return {"items": [post_view(post, author) for post, author in rows[:limit]], "nextCursor": rows[limit-1][0].id if len(rows) > limit else None}

@router.post("", status_code=201)
def create_post(data: PostInput, user: User = Depends(require_user), db: Session = Depends(get_db)):
    post = Post(user_id=user.id, title=data.title.strip(), body=data.body.strip(), category=data.category)
    db.add(post)
    db.commit()
    return post_view(post, user)

@router.get("/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db)):
    row = db.execute(select(Post, User).join(User, User.id == Post.user_id).where(Post.id == post_id)).first()
    if not row:
        raise HTTPException(404, "게시글을 찾을 수 없습니다.")
    return post_view(*row)

def owned_post(post_id: int, user: User, db: Session):
    post = db.get(Post, post_id)
    if not post:
        raise HTTPException(404, "게시글을 찾을 수 없습니다.")
    if post.user_id != user.id:
        raise HTTPException(403, "본인의 게시글만 변경할 수 있습니다.")
    return post

@router.patch("/{post_id}")
def update_post(post_id: int, data: PostInput, user: User = Depends(require_user), db: Session = Depends(get_db)):
    post = owned_post(post_id, user, db)
    post.title, post.body, post.category = data.title.strip(), data.body.strip(), data.category
    db.commit()
    return post_view(post, user)

@router.delete("/{post_id}", status_code=204)
def delete_post(post_id: int, user: User = Depends(require_user), db: Session = Depends(get_db)):
    db.delete(owned_post(post_id, user, db))
    db.commit()
