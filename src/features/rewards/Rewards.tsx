import { useEffect, useState } from "react";
import { Modal } from "../../components/Modal";
import { useAuth } from "../../stores/auth";
import { useUI } from "../../stores/ui";
import { townService } from "../../api/townService";
import { errorMessage } from "../../api/client";
import { AuthPrompt } from "../auth/AuthModal";
import { useRewardAction, useTodayRewards } from "./useRewards";
import { REWARD_PLACES } from "../../game/config/rewards";
import type { Quest } from "../../types/api";

function QuestPreparation({ quest }: { quest: Quest }) {
  const [time, setTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const seconds = quest.readyAt
    ? Math.max(0, Math.ceil((new Date(quest.readyAt).getTime() - time) / 1000))
    : 0;
  return (
    <p className="muted">
      {seconds
        ? `준비 중 · ${seconds}초 후 전달할 수 있어요.`
        : "준비 완료 · 목적지에서 E를 눌러 전달해 주세요."}
    </p>
  );
}
export function RewardsCard() {
  const user = useAuth((state) => state.user);
  return <DailyCard key={user?.id ?? "guest"} />;
}
function DailyCard() {
  const user = useAuth((state) => state.user);
  const query = useTodayRewards();
  const action = useRewardAction();
  const data = query.data;
  return (
    <section className="dashboard-card reward-card">
      <span className="eyebrow">A LITTLE ADVENTURE</span>
      <h2>오늘의 작은 산책</h2>
      <p className="card-description">
        출석하고, 산책하고, 이웃의 편지와 물품을 배달해 보세요.
      </p>
      {!user ? (
        <p className="muted">로그인하면 하루 최대 550코인을 모을 수 있어요.</p>
      ) : query.isPending ? (
        <p>오늘의 소식을 불러오는 중…</p>
      ) : query.isError ? (
        <p role="alert">
          {errorMessage(query.error)}{" "}
          <button onClick={() => void query.refetch()}>다시 불러오기</button>
        </p>
      ) : (
        data && (
          <>
            <div className="reward-summary">
              <strong>
                오늘 모은 코인 · {data.earned} / {data.dailyLimit}
              </strong>
              <small>한국 시간 매일 00:00에 새롭게 시작해요.</small>
            </div>
            <div className="reward-actions">
              <button
                className="secondary-button"
                disabled={action.busy || data.checkin}
                onClick={() =>
                  void action.run(() => townService.checkin(data.dayKey))
                }
              >
                {data.checkin ? "오늘 출석 완료" : "출석하기 · +100"}
              </button>
              <button
                className="secondary-button"
                disabled={
                  action.busy ||
                  data.walkComplete ||
                  !data.stamps.every((spot) => spot.claimed)
                }
                onClick={() =>
                  void action.run(() => townService.completeWalk(data.dayKey))
                }
              >
                {data.walkComplete ? "산책 보상 완료" : "산책 완료 보상 · +100"}
              </button>
            </div>
            <div className="stamp-list" aria-label="오늘의 산책 도장">
              {data.stamps.map((spot) => (
                <span className={spot.claimed ? "claimed" : ""} key={spot.id}>
                  {spot.claimed ? "✓" : "○"} {spot.name}
                </span>
              ))}
            </div>
            <div className="quest-list">
              {data.quests.map((quest) => (
                <article key={quest.code}>
                  <span>{quest.code === "mail_delivery" ? "✉" : "▣"}</span>
                  <div>
                    <strong>{quest.title}</strong>
                    <p>
                      {quest.status === "completed"
                        ? "오늘 배달 완료 ✓"
                        : quest.status === "active"
                          ? `배달 중 → ${quest.targetName}`
                          : `${quest.npc}에게 E로 심부름을 받아요.`}
                    </p>
                  </div>
                  <b>+{quest.amount}</b>
                </article>
              ))}
            </div>
            {action.error && (
              <p className="form-error" role="alert">
                {action.error}
              </p>
            )}
            {action.message && (
              <p className="form-success" role="status">
                {action.message}
              </p>
            )}
          </>
        )
      )}
      <a className="primary-button" href="#/game">
        산책과 배달 하러 가기 ↗
      </a>
    </section>
  );
}
export function RewardsModal() {
  const user = useAuth((state) => state.user);
  const place = useUI((state) => state.rewardPlace);
  return <RewardVisit key={`${user?.id ?? "guest"}-${place}`} place={place} />;
}
function RewardVisit({ place }: { place: string | null }) {
  const user = useAuth((state) => state.user);
  const query = useTodayRewards();
  const action = useRewardAction();
  const data = query.data;
  const spot = data?.stamps.find((spot) => spot.id === place);
  const quest = data?.quests.find(
    (quest) => quest.sourceId === place || quest.targetId === place,
  );
  const label =
    REWARD_PLACES.find((station) => station.id === place)?.label ??
    "마을의 작은 선물";
  return (
    <Modal
      title={quest?.sourceId === place ? quest.npc : label}
      eyebrow="LITTLE REWARDS & LETTERS"
      busy={action.busy}
    >
      {!user ? (
        <AuthPrompt />
      ) : query.isPending ? (
        <p>오늘의 이야기를 불러오는 중…</p>
      ) : query.isError ? (
        <p role="alert">
          {errorMessage(query.error)}{" "}
          <button onClick={() => void query.refetch()}>다시 불러오기</button>
        </p>
      ) : (
        data && (
          <>
            {spot && (
              <div className="reward-visit">
                <div className="reward-symbol">{spot.claimed ? "✓" : "✳"}</div>
                <h3>{spot.name}에 잘 왔어요!</h3>
                <p>오늘의 산책 도장과 50코인을 받아 가세요.</p>
                <button
                  className="primary-button"
                  disabled={action.busy || spot.claimed}
                  onClick={() =>
                    void action.run(() =>
                      townService.stamp(data.dayKey, spot.id),
                    )
                  }
                >
                  {spot.claimed
                    ? "오늘 도장을 받았어요"
                    : "산책 도장 받기 · +50"}
                </button>
              </div>
            )}
            {quest && (
              <div className="reward-visit">
                <div className="reward-symbol">
                  {quest.code === "mail_delivery" ? "✉" : "▣"}
                </div>
                <h3>{quest.title}</h3>
                <p>{quest.description}</p>
                <p className="quest-destination">
                  목적지 · {quest.targetName}{" "}
                  <strong>+{quest.amount} 코인</strong>
                </p>
                {quest.status === "completed" ? (
                  <p className="form-success">
                    오늘의 배달을 마쳤어요. 내일 다시 만나요!
                  </p>
                ) : quest.sourceId === place ? (
                  <>
                    <button
                      className="primary-button"
                      disabled={action.busy || quest.status === "active"}
                      onClick={() =>
                        void action.run(() =>
                          townService.acceptQuest(data.dayKey, quest.code),
                        )
                      }
                    >
                      {quest.status === "active"
                        ? "배달 진행 중"
                        : "심부름 받기"}
                    </button>
                    {quest.status === "active" && (
                      <QuestPreparation quest={quest} />
                    )}
                  </>
                ) : quest.status === "active" && quest.assignmentId ? (
                  <>
                    <QuestPreparation quest={quest} />
                    <button
                      className="primary-button"
                      disabled={action.busy}
                      onClick={() =>
                        void action.run(() =>
                          townService.deliverQuest(
                            data.dayKey,
                            quest.assignmentId!,
                            quest.targetId,
                          ),
                        )
                      }
                    >
                      배달 완료하기 · +{quest.amount}
                    </button>
                  </>
                ) : (
                  <p className="notice">
                    {quest.npc}에게 먼저 심부름을 받아 주세요.
                  </p>
                )}
              </div>
            )}
            {action.error && (
              <p className="form-error" role="alert">
                {action.error}
              </p>
            )}
            {action.message && (
              <p className="form-success" role="status">
                {action.message}
              </p>
            )}
            <div className="stamp-list">
              {data.stamps.map((spot) => (
                <span className={spot.claimed ? "claimed" : ""} key={spot.id}>
                  {spot.claimed ? "✓" : "○"} {spot.name}
                </span>
              ))}
            </div>
            <p className="notice">
              오늘 받은 코인 {data.earned} / {data.dailyLimit} · 한국 시간
              자정에 새로운 하루가 시작돼요.
            </p>
          </>
        )
      )}
    </Modal>
  );
}
export function QuestTracker() {
  const query = useTodayRewards();
  const user = useAuth((state) => state.user);
  if (!user) return null;
  const active = query.data?.quests.filter(
    (quest) => quest.status === "active",
  );
  return (
    <aside className="quest-tracker" aria-label="진행 중인 배달">
      <strong>✉ 오늘의 배달</strong>
      {active?.length ? (
        active.map((quest) => (
          <p key={quest.code}>
            {quest.title}
            <small>
              → {quest.targetName} · +{quest.amount} 코인
            </small>
          </p>
        ))
      ) : (
        <p>우체부 모찌 또는 상점 주인 참치에게 말을 걸어보세요.</p>
      )}
    </aside>
  );
}
