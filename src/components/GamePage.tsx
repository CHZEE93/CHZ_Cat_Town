import { GameCanvas } from "./GameCanvas";
import { useUI } from "../stores/ui";
import { QuestTracker } from "../features/rewards/Rewards";
export function GamePage({
  active,
  expanded,
  onFullscreen,
}: {
  active: boolean;
  expanded: boolean;
  onFullscreen: () => void;
}) {
  const { modal, nearby, ready, open } = useUI();
  return (
    <main
      className="game-page"
      tabIndex={-1}
      id={active ? "main-content" : undefined}
      hidden={!active}
    >
      <section className="town-frame" aria-label="플레이 가능한 3D 고양이 마을">
        <GameCanvas active={active} />
        <div className="map-label">
          <span className="map-symbol">⌘</span>
          <div>
            치즈 마을<small>COZY 3D VILLAGE · 01</small>
          </div>
        </div>
        <div className="town-tools">
          <button onClick={() => open("profile")}>고양이 선택</button>
          <button aria-pressed={expanded} onClick={onFullscreen}>
            {expanded ? "전체화면 나가기" : "전체화면"} ⛶
          </button>
        </div>
        {!ready && <div className="loading">마을의 문을 여는 중…</div>}
        {nearby && !modal && active && (
          <div className="interaction" role="status">
            <kbd>E</kbd>
            {nearby.label}
          </div>
        )}
        <div className="map-caption">작은 마을, 함께할 이야기.</div>
        {active && <QuestTracker />}
      </section>
      <div className="game-controls">
        <div className="controls">
          <span>
            <kbd>W A S D</kbd> / 방향키 이동
          </span>
          <span>
            <kbd>E</kbd> 상호작용
          </span>
          <span>
            <kbd>ESC</kbd> 창 닫기
          </span>
        </div>
        <button onClick={() => open("guide")}>이용 안내 ↗</button>
      </div>
    </main>
  );
}
