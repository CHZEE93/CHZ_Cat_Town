from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select, delete
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Character, Wallet, CoinTransaction, LoginSession, now
from ..schemas import Signup, Login
from ..security import passwords, DUMMY_HASH, limit_auth, issue_session, current_session, require_user
from ..config import STARTING_COINS, SESSION_COOKIE
from ..views import user_view, character_view
router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/session")
def session_info(request: Request, response: Response, db: Session = Depends(get_db)):
    response.headers["Cache-Control"] = "no-store"
    session = current_session(request, db)
    if session is None:
        return {"user": None, "csrfToken": None, "character": None}
    return {"user": user_view(db.get(User, session.user_id)), "csrfToken": session.csrf_token, "character": character_view(db, session.user_id)}

@router.post("/signup", status_code=201, dependencies=[Depends(limit_auth)])
def signup(data: Signup, request: Request, response: Response, db: Session = Depends(get_db)):
    user = User(email=str(data.email).lower(), nickname=data.nickname.strip(), password_hash=passwords.hash(data.password))
    db.add(user)
    try:
        db.flush()
        db.add_all([Character(user_id=user.id, cat_type=data.catType, scale=data.scale), Wallet(user_id=user.id, balance=STARTING_COINS), CoinTransaction(user_id=user.id, amount=STARTING_COINS, reason="signup")])
        session = issue_session(db, user, response, request)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "이미 가입된 이메일입니다.")
    return {"user": user_view(user), "csrfToken": session.csrf_token, "character": character_view(db, user.id)}

@router.post("/login", dependencies=[Depends(limit_auth)])
def login(data: Login, request: Request, response: Response, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == str(data.email).lower()))
    valid = passwords.verify(data.password, user.password_hash if user else DUMMY_HASH)
    if not user or not valid:
        raise HTTPException(401, "이메일 또는 비밀번호를 확인해 주세요.")
    db.execute(delete(LoginSession).where(LoginSession.expires_at < now()))
    session = issue_session(db, user, response, request)
    db.commit()
    return {"user": user_view(user), "csrfToken": session.csrf_token, "character": character_view(db, user.id)}

@router.post("/logout", status_code=204)
def logout(request: Request, response: Response, user: User = Depends(require_user), db: Session = Depends(get_db)):
    session = current_session(request, db)
    db.delete(session)
    db.commit()
    response.delete_cookie(SESSION_COOKIE, path="/")
