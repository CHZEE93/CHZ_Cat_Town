from fastapi import FastAPI, APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from .database import SessionLocal
from .routes import auth, account, posts, shop, rewards
from .security import check_origin
app = FastAPI(title="CHZ Cat Town API", version="0.3.0")
api = APIRouter(prefix="/api", dependencies=[Depends(check_origin)])
for router in [auth.router, account.router, posts.router, shop.router, rewards.router]:
    api.include_router(router)
app.include_router(api)

@app.middleware("http")
async def response_headers(request: Request, call_next):
    try:
        size = int(request.headers.get("content-length", "0") or 0)
    except ValueError:
        return JSONResponse({"detail": "올바르지 않은 요청입니다."}, status_code=400)
    if size > 65536:
        return JSONResponse({"detail": "요청 크기가 너무 큽니다."}, status_code=413)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Cache-Control"] = "no-store"
    return response

@app.get("/api/health")
def health():
    with SessionLocal() as db:
        db.execute(text("SELECT 1"))
    return {"status": "ok"}
