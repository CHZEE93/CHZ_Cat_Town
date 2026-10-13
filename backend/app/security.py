from datetime import timedelta
import hashlib
import secrets
import time
from fastapi import Depends, HTTPException, Request, Response
from sqlalchemy import select, case
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from .database import get_db, SessionLocal
from .models import LoginSession, User, AuthRateLimit, now
from .config import SESSION_COOKIE, SESSION_SECONDS, COOKIE_SECURE, ALLOWED_ORIGINS
passwords = PasswordHash.recommended()
DUMMY_HASH = passwords.hash("this-is-not-a-user-password")

def token_hash(token: str):
    return hashlib.sha256(token.encode()).hexdigest()

def check_origin(request: Request):
    if request.method not in {"GET", "HEAD", "OPTIONS"} and request.headers.get("origin") not in ALLOWED_ORIGINS:
        raise HTTPException(403, "허용되지 않은 요청 출처입니다.")

def limit_auth(request: Request):
    # Shared DB bucket: rate limit survives restarts and multiple API workers.
    key = token_hash(request.client.host if request.client else "unknown")
    window = int(time.time()) // 60
    with SessionLocal() as db:
        statement = insert(AuthRateLimit).values(key=key, window=window, count=1)
        statement = statement.on_conflict_do_update(index_elements=[AuthRateLimit.key], set_={
            "window": window, "count": case((AuthRateLimit.window == window, AuthRateLimit.count + 1), else_=1)
        }).returning(AuthRateLimit.count)
        count = db.scalar(statement)
        db.commit()
    if count > 20:
        raise HTTPException(429, "로그인 요청이 많습니다. 잠시 후 다시 시도해 주세요.", headers={"Retry-After": "60"})

def current_session(request: Request, db: Session):
    raw = request.cookies.get(SESSION_COOKIE)
    if not raw or len(raw) > 128:
        return None
    return db.scalar(select(LoginSession).where(LoginSession.token_hash == token_hash(raw), LoginSession.expires_at > now()))

def require_user(request: Request, db: Session = Depends(get_db)):
    session = current_session(request, db)
    if session is None:
        raise HTTPException(401, "로그인이 필요합니다.")
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        csrf = request.headers.get("x-csrf-token", "")
        if not secrets.compare_digest(csrf, session.csrf_token):
            raise HTTPException(403, "보안 토큰이 만료되었습니다. 새로고침 후 다시 시도해 주세요.")
    return db.get(User, session.user_id)

def issue_session(db: Session, user: User, response: Response, request: Request):
    old = current_session(request, db)
    if old:
        db.delete(old)
    raw = secrets.token_urlsafe(32)
    session = LoginSession(token_hash=token_hash(raw), user_id=user.id, csrf_token=secrets.token_urlsafe(32), expires_at=now() + timedelta(seconds=SESSION_SECONDS))
    db.add(session)
    response.set_cookie(SESSION_COOKIE, raw, max_age=SESSION_SECONDS, httponly=True, secure=COOKIE_SECURE, samesite="lax", path="/")
    return session
