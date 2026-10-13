from concurrent.futures import ThreadPoolExecutor
from uuid import uuid4
from datetime import timedelta
from sqlalchemy import select, func

def purchase(client, product=1, key=None):
    return client.post("/api/shop/purchases", json={"productId": product}, headers={"Idempotency-Key": key or str(uuid4())})

def test_signup_session_cookie_logout_and_login(resident):
    session = resident.get("/api/auth/session").json()
    assert session["user"]["nickname"] == "치즈"
    assert session["character"]["catType"] == "calico"
    assert resident.get("/api/wallet/me").json() == {"balance": 1000}
    from app.database import SessionLocal
    from app.models import User, LoginSession
    with SessionLocal() as db:
        assert db.scalar(select(User)).password_hash.startswith("$argon2")
        assert db.scalar(select(LoginSession)).token_hash != resident.cookies.get("chz_session")
    old_cookie = resident.cookies.get("chz_session")
    assert resident.post("/api/auth/logout").status_code == 204
    assert resident.get("/api/wallet/me").status_code == 401
    resident.cookies.set("chz_session", old_cookie)
    assert resident.get("/api/wallet/me").status_code == 401
    resident.cookies.clear()
    response = resident.post("/api/auth/login", json={"email": "CAT@example.com", "password": "a-safe-password"})
    assert response.status_code == 200
    cookie = response.headers["set-cookie"].lower()
    assert "httponly" in cookie and "samesite=lax" in cookie
    assert "password" not in response.text
    assert resident.get("/api/wallet/me").json()["balance"] == 1000
    assert len(resident.get("/api/wallet/me/transactions").json()) == 1

def test_auth_validation_and_rate_limit(client):
    assert client.post("/api/auth/signup", json={"email": "bad", "password": "short", "nickname": " "}).status_code == 422
    for _ in range(19):
        client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "wrong-password"})
    assert client.post("/api/auth/login", json={"email": "nobody@example.com", "password": "wrong-password"}).status_code == 429

def test_csrf_origin_and_expired_session(resident):
    data = {"nickname": "변경", "bio": "안녕"}
    assert resident.patch("/api/users/me", json=data, headers={"X-CSRF-Token": "bad"}).status_code == 403
    assert resident.patch("/api/users/me", json=data, headers={"Origin": "https://evil.example"}).status_code == 403
    assert resident.patch("/api/users/me", json={"nickname": " ", "bio": ""}).status_code == 422
    from app.database import SessionLocal
    from app.models import LoginSession, now
    with SessionLocal() as db:
        db.scalar(select(LoginSession)).expires_at = now() - timedelta(seconds=1)
        db.commit()
    assert resident.get("/api/auth/session").json()["user"] is None
    assert resident.get("/api/wallet/me").status_code == 401

def test_profile_and_post_ownership_pagination(resident):
    assert resident.patch("/api/users/me", json={"nickname": "나비", "bio": "반가워요"}).json()["bio"] == "반가워요"
    data = {"title": "첫 인사", "body": "<script>plain text</script>", "category": "인사"}
    first = resident.post("/api/posts", json=data).json()
    assert resident.get(f"/api/posts/{first['id']}").json()["author"] == "나비"
    assert resident.patch(f"/api/posts/{first['id']}", json={**data, "title": "수정"}).json()["title"] == "수정"
    second = resident.post("/api/posts", json=data).json()
    page = resident.get("/api/posts?limit=1").json()
    assert page["items"][0]["id"] == second["id"]
    assert resident.get(f"/api/posts?before={page['nextCursor']}").json()["items"][0]["id"] == first["id"]
    assert resident.delete(f"/api/posts/{second['id']}").status_code == 204
    resident.post("/api/auth/logout")
    assert resident.post("/api/posts", json=data).status_code == 401
    response = resident.post("/api/auth/signup", json={"email": "other@example.com", "password": "another-password", "nickname": "다른 주민"})
    resident.headers["X-CSRF-Token"] = response.json()["csrfToken"]
    assert resident.patch(f"/api/posts/{first['id']}", json=data).status_code == 403
    assert resident.delete(f"/api/posts/{first['id']}").status_code == 403

def test_atomic_purchase_replay_and_owned_equipment(resident):
    key = str(uuid4())
    first = purchase(resident, key=key)
    assert first.status_code == 200, first.text
    repeat = purchase(resident, key=key)
    assert repeat.json()["purchaseId"] == first.json()["purchaseId"]
    assert repeat.json()["replayed"] is True
    assert resident.get("/api/wallet/me").json()["balance"] == 700
    assert purchase(resident).status_code == 409
    assert purchase(resident, product=2, key=key).status_code == 409
    assert len(resident.get("/api/inventory/me").json()) == 1
    assert len(resident.get("/api/wallet/me/transactions").json()) == 2
    data = {"catType": "tuxedo", "version": 1, "equipped": {"head": "straw_hat", "neck": None, "back": None}}
    saved = resident.patch("/api/characters/me", json=data)
    assert saved.status_code == 200, saved.text
    assert saved.json()["version"] == 2
    assert resident.get("/api/characters/me").json() == saved.json()
    assert resident.patch("/api/characters/me", json=data).status_code == 409
    data["version"] = 2
    data["equipped"]["neck"] = "red_ribbon"
    assert resident.patch("/api/characters/me", json=data).status_code == 400
    data["equipped"]["neck"] = "straw_hat"
    assert resident.patch("/api/characters/me", json=data).status_code == 400
    data["equipped"] = {"head": None, "neck": None, "back": None}
    assert resident.patch("/api/characters/me", json=data).status_code == 200

def test_insufficient_funds_does_not_partially_write(resident):
    from app.database import SessionLocal
    from app.models import Wallet, Purchase, InventoryItem, CoinTransaction
    with SessionLocal() as db:
        db.scalar(select(Wallet)).balance = 10
        db.commit()
    assert purchase(resident).status_code == 400
    with SessionLocal() as db:
        assert db.scalar(select(Wallet)).balance == 10
        assert db.scalar(select(func.count()).select_from(Purchase)) == 0
        assert db.scalar(select(func.count()).select_from(InventoryItem)) == 0
        assert db.scalar(select(func.count()).select_from(CoinTransaction)) == 1

def test_concurrent_purchases_never_double_charge(resident):
    from fastapi.testclient import TestClient
    from app.main import app
    key = str(uuid4())
    def buy(_):
        with TestClient(app, headers=dict(resident.headers), cookies=dict(resident.cookies)) as client:
            return purchase(client, key=key)
    with ThreadPoolExecutor(max_workers=4) as pool:
        responses = list(pool.map(buy, range(4)))
    assert all(response.status_code == 200 for response in responses), [r.text for r in responses]
    assert len({response.json()["purchaseId"] for response in responses}) == 1
    assert resident.get("/api/wallet/me").json()["balance"] == 700
    assert len(resident.get("/api/inventory/me").json()) == 1

def test_competing_products_cannot_overspend(resident):
    from fastapi.testclient import TestClient
    from app.main import app
    from app.database import SessionLocal
    from app.models import Wallet
    with SessionLocal() as db:
        db.scalar(select(Wallet)).balance = 500
        db.commit()
    def buy(product):
        with TestClient(app, headers=dict(resident.headers), cookies=dict(resident.cookies)) as client:
            return purchase(client, product=product)
    with ThreadPoolExecutor(max_workers=2) as pool:
        responses = list(pool.map(buy, [1, 3]))
    assert sorted(response.status_code for response in responses) == [200, 400]
    assert resident.get("/api/wallet/me").json()["balance"] in [200, 50]
    assert len(resident.get("/api/inventory/me").json()) == 1
