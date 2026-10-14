from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from uuid import uuid4
import pytest
from sqlalchemy import select

def day(client):
    return client.get("/api/rewards/today").json()["dayKey"]

def prepare_assignment(assignment_id):
    from app.database import SessionLocal
    from app.models import QuestAssignment, now
    with SessionLocal() as db:
        db.get(QuestAssignment, assignment_id).accepted_at = now() - timedelta(seconds=21)
        db.commit()

def test_checkin_idempotency_and_stale_day(resident):
    key = day(resident)
    result = resident.post("/api/rewards/checkin", json={"dayKey": key})
    assert result.status_code == 200, result.text
    repeat = resident.post("/api/rewards/checkin", json={"dayKey": key}).json()
    assert repeat["claimId"] == result.json()["claimId"] and repeat["replayed"]
    assert repeat["balance"] == 1100
    assert resident.post("/api/rewards/checkin", json={"dayKey": "2000-01-01"}).status_code == 409
    assert resident.post("/api/rewards/checkin", json={"dayKey": key, "amount": 99999}).status_code == 422
    assert len(resident.get("/api/wallet/me/transactions").json()) == 2

def test_walk_requirements_and_repeat(resident):
    key = day(resident)
    assert resident.post("/api/rewards/walk/complete", json={"dayKey": key}).status_code == 409
    assert resident.post("/api/rewards/walk/stamps", json={"dayKey": key, "spotId": "unknown"}).status_code == 422
    for spot in ["plaza", "park", "garden"]:
        assert resident.post("/api/rewards/walk/stamps", json={"dayKey": key, "spotId": spot}).status_code == 200
    result = resident.post("/api/rewards/walk/complete", json={"dayKey": key}).json()
    assert result["balance"] == 1250 and result["today"]["walkComplete"]
    assert resident.post("/api/rewards/walk/complete", json={"dayKey": key}).json()["replayed"]

@pytest.mark.parametrize("code,target,amount", [("mail_delivery", "home_mailbox", 80), ("shop_errand", "garden_drop", 120)])
def test_quest_accept_prepare_deliver_persist_and_replay(resident, code, target, amount):
    key = day(resident)
    state = resident.post("/api/rewards/quests/accept", json={"dayKey": key, "questCode": code}).json()
    assignment = next(quest for quest in state["quests"] if quest["code"] == code)
    repeated = resident.post("/api/rewards/quests/accept", json={"dayKey": key, "questCode": code}).json()
    assert next(quest for quest in repeated["quests"] if quest["code"] == code)["assignmentId"] == assignment["assignmentId"]
    data = {"dayKey": key, "assignmentId": assignment["assignmentId"], "targetId": target}
    assert resident.post("/api/rewards/quests/complete", json=data).status_code == 409
    assert resident.post("/api/rewards/quests/complete", json={**data, "targetId": "garden_drop" if target == "home_mailbox" else "home_mailbox"}).status_code == 409
    assert resident.post("/api/rewards/quests/complete", json={**data, "assignmentId": str(uuid4())}).status_code == 404
    prepare_assignment(assignment["assignmentId"])
    response = resident.post("/api/rewards/quests/complete", json=data)
    assert response.status_code == 200, response.text
    assert response.json()["balance"] == 1000 + amount
    assert resident.post("/api/rewards/quests/complete", json=data).json()["replayed"]
    state = resident.get("/api/rewards/today").json()
    assert next(quest for quest in state["quests"] if quest["code"] == code)["status"] == "completed"

def test_concurrent_claims_and_purchase_are_atomic(resident):
    from fastapi.testclient import TestClient
    from app.main import app
    key = day(resident)
    def call(index):
        with TestClient(app, headers=dict(resident.headers), cookies=dict(resident.cookies)) as client:
            if index == 0:
                return client.post("/api/shop/purchases", json={"productId": 1}, headers={"Idempotency-Key": str(uuid4())})
            return client.post("/api/rewards/checkin", json={"dayKey": key})
    with ThreadPoolExecutor(max_workers=5) as pool:
        responses = list(pool.map(call, range(5)))
    assert all(response.status_code == 200 for response in responses), [response.text for response in responses]
    assert len({response.json()["claimId"] for response in responses[1:]}) == 1
    assert resident.get("/api/wallet/me").json()["balance"] == 800

def test_daily_limit_and_quest_ownership(resident):
    from fastapi.testclient import TestClient
    from app.main import app
    key = day(resident)
    resident.post("/api/rewards/checkin", json={"dayKey": key})
    for spot in ["plaza", "park", "garden"]:
        resident.post("/api/rewards/walk/stamps", json={"dayKey": key, "spotId": spot})
    resident.post("/api/rewards/walk/complete", json={"dayKey": key})
    for code, target in [("mail_delivery", "home_mailbox"), ("shop_errand", "garden_drop")]:
        state = resident.post("/api/rewards/quests/accept", json={"dayKey": key, "questCode": code}).json()
        quest = next(quest for quest in state["quests"] if quest["code"] == code)
        prepare_assignment(quest["assignmentId"])
        data = {"dayKey": key, "assignmentId": quest["assignmentId"], "targetId": target}
        with TestClient(app, headers={"Origin": "http://localhost:5180"}) as other:
            session = other.post("/api/auth/signup", json={"email": code + "@example.com", "password": "a-safe-password", "nickname": "다른 주민"}).json()
            other.headers["X-CSRF-Token"] = session["csrfToken"]
            assert other.post("/api/rewards/quests/complete", json=data).status_code == 404
        assert resident.post("/api/rewards/quests/complete", json=data).status_code == 200
        assert resident.post("/api/rewards/quests/complete", json=data).json()["replayed"]
    state = resident.get("/api/rewards/today").json()
    assert state["earned"] == state["dailyLimit"] == 550
    assert resident.get("/api/wallet/me").json()["balance"] == 1550

def test_seoul_midnight_and_expired_quest_day(resident, monkeypatch):
    from app.routes import rewards
    before = datetime(2026, 10, 14, 14, 59, 59, tzinfo=timezone.utc)
    monkeypatch.setattr(rewards, "now", lambda: before)
    key = day(resident)
    assert key == "2026-10-14"
    assert resident.post("/api/rewards/checkin", json={"dayKey": key}).status_code == 200
    assert resident.post("/api/rewards/quests/accept", json={"dayKey": key, "questCode": "mail_delivery"}).status_code == 409
    monkeypatch.setattr(rewards, "now", lambda: before + timedelta(seconds=1))
    assert day(resident) == "2026-10-15"
    assert resident.get("/api/rewards/today").json()["earned"] == 0
    assert resident.post("/api/rewards/checkin", json={"dayKey": key}).status_code == 409
    assert resident.post("/api/rewards/checkin", json={"dayKey": day(resident)}).json()["balance"] == 1200

def test_rewards_require_auth_and_csrf(client, resident):
    key = day(resident)
    assert resident.post("/api/rewards/checkin", json={"dayKey": key}, headers={"X-CSRF-Token": "wrong"}).status_code == 403
    resident.post("/api/auth/logout")
    assert resident.get("/api/rewards/today").status_code == 401
