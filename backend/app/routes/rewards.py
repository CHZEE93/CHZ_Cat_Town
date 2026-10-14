from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo
from uuid import UUID, uuid4
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Wallet, CoinTransaction, RewardClaim, QuestAssignment, now
from ..schemas import Input
from ..security import require_user

router = APIRouter(prefix="/rewards", tags=["rewards"])
SEOUL = ZoneInfo("Asia/Seoul")
STAMPS = {"plaza": "중앙 광장", "park": "서쪽 공원", "garden": "동쪽 정원"}
QUESTS = {
    "mail_delivery": {"title": "우체부 모찌의 편지 배달", "npc": "우체부 모찌", "description": "마을 주민에게 온 편지를 집 옆 우편함에 넣어 주세요.", "sourceId": "postman", "targetId": "home_mailbox", "targetName": "집 옆 우편함", "amount": 80},
    "shop_errand": {"title": "상점 주인 참치의 심부름", "npc": "상점 주인 참치", "description": "정원에 필요한 작은 물품 상자를 동쪽 정원에 가져다 주세요.", "sourceId": "merchant", "targetId": "garden_drop", "targetName": "동쪽 정원 배달대", "amount": 120},
}
QUEST_SECONDS = 20

class DayInput(Input):
    dayKey: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
class StampInput(DayInput):
    spotId: Literal["plaza", "park", "garden"]
class QuestInput(DayInput):
    questCode: Literal["mail_delivery", "shop_errand"]
class DeliveryInput(DayInput):
    assignmentId: UUID
    targetId: Literal["home_mailbox", "garden_drop"]

def calendar():
    day = now().astimezone(SEOUL).date()
    reset = datetime.combine(day + timedelta(days=1), time.min, SEOUL)
    return day, reset

def lock_day(db, user_id, data):
    wallet = db.scalar(select(Wallet).where(Wallet.user_id == user_id).with_for_update())
    day, reset = calendar()
    if data.dayKey != day.isoformat():
        raise HTTPException(409, "새로운 하루가 시작됐어요. 오늘의 보상을 다시 불러와 주세요.")
    return wallet, day, reset

def today_view(db, user_id):
    day, reset = calendar()
    claims = {row.reward_code: row for row in db.scalars(select(RewardClaim).where(RewardClaim.user_id == user_id, RewardClaim.day_key == day))}
    assignments = {row.quest_code: row for row in db.scalars(select(QuestAssignment).where(QuestAssignment.user_id == user_id, QuestAssignment.day_key == day))}
    quests = []
    for code, definition in QUESTS.items():
        assignment = assignments.get(code)
        quests.append({**definition, "code": code, "status": "completed" if code in claims else "active" if assignment else "available", "assignmentId": assignment.id if assignment else None, "readyAt": assignment.accepted_at + timedelta(seconds=QUEST_SECONDS) if assignment else None})
    return {"dayKey": day.isoformat(), "resetsAt": reset, "dailyLimit": 550, "earned": sum(row.amount for row in claims.values()), "checkin": "daily_checkin" in claims, "walkComplete": "walk_complete" in claims, "stamps": [{"id": code, "name": name, "claimed": "walk_" + code in claims, "amount": 50} for code, name in STAMPS.items()], "quests": quests}

def grant(db, wallet, day, code, amount, reason):
    previous = db.scalar(select(RewardClaim).where(RewardClaim.user_id == wallet.user_id, RewardClaim.day_key == day, RewardClaim.reward_code == code))
    if previous:
        return {"claimId": previous.id, "amount": previous.amount, "replayed": True}
    claim = RewardClaim(id=str(uuid4()), user_id=wallet.user_id, day_key=day, reward_code=code, amount=amount)
    db.add(claim)
    db.flush()
    wallet.balance += amount
    db.add(CoinTransaction(user_id=wallet.user_id, amount=amount, reason=reason, reward_claim_id=claim.id))
    return {"claimId": claim.id, "amount": amount, "replayed": False}

def finish_response(db, user_id, wallet, result):
    db.commit()
    return {**result, "balance": wallet.balance, "today": today_view(db, user_id)}

@router.get("/today")
def today(user: User = Depends(require_user), db: Session = Depends(get_db)):
    return today_view(db, user.id)

@router.post("/checkin")
def checkin(data: DayInput, user: User = Depends(require_user), db: Session = Depends(get_db)):
    wallet, day, _ = lock_day(db, user.id, data)
    return finish_response(db, user.id, wallet, grant(db, wallet, day, "daily_checkin", 100, "daily_checkin"))

@router.post("/walk/stamps")
def stamp(data: StampInput, user: User = Depends(require_user), db: Session = Depends(get_db)):
    wallet, day, _ = lock_day(db, user.id, data)
    return finish_response(db, user.id, wallet, grant(db, wallet, day, "walk_" + data.spotId, 50, "walk_stamp"))

@router.post("/walk/complete")
def walk_complete(data: DayInput, user: User = Depends(require_user), db: Session = Depends(get_db)):
    wallet, day, _ = lock_day(db, user.id, data)
    codes = set(db.scalars(select(RewardClaim.reward_code).where(RewardClaim.user_id == user.id, RewardClaim.day_key == day)))
    if not all("walk_" + spot in codes for spot in STAMPS):
        raise HTTPException(409, "산책 도장 3개를 먼저 모아 주세요.")
    return finish_response(db, user.id, wallet, grant(db, wallet, day, "walk_complete", 100, "walk_complete"))

@router.post("/quests/accept")
def accept(data: QuestInput, user: User = Depends(require_user), db: Session = Depends(get_db)):
    _, day, reset = lock_day(db, user.id, data)
    assignment = db.scalar(select(QuestAssignment).where(QuestAssignment.user_id == user.id, QuestAssignment.day_key == day, QuestAssignment.quest_code == data.questCode))
    if not assignment:
        if now() + timedelta(seconds=QUEST_SECONDS) >= reset:
            raise HTTPException(409, "오늘이 곧 끝나요. 잠시 후 새로운 심부름을 받아 주세요.")
        db.add(QuestAssignment(id=str(uuid4()), user_id=user.id, day_key=day, quest_code=data.questCode))
    db.commit()
    return today_view(db, user.id)

@router.post("/quests/complete")
def deliver(data: DeliveryInput, user: User = Depends(require_user), db: Session = Depends(get_db)):
    wallet, day, _ = lock_day(db, user.id, data)
    assignment = db.scalar(select(QuestAssignment).where(QuestAssignment.id == str(data.assignmentId), QuestAssignment.user_id == user.id, QuestAssignment.day_key == day))
    if not assignment:
        raise HTTPException(404, "오늘 받은 심부름을 찾을 수 없어요.")
    definition = QUESTS[assignment.quest_code]
    if data.targetId != definition["targetId"]:
        raise HTTPException(409, "이 심부름의 배달 목적지가 아니에요.")
    if not assignment.completed_at and now() < assignment.accepted_at + timedelta(seconds=QUEST_SECONDS):
        raise HTTPException(409, "편지와 물품을 준비하고 있어요. 잠시 후 전달해 주세요.")
    result = grant(db, wallet, day, assignment.quest_code, definition["amount"], assignment.quest_code)
    assignment.completed_at = assignment.completed_at or now()
    return finish_response(db, user.id, wallet, result)
