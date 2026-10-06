import { useFullscreen } from "./components/useFullscreen";
import { GameCanvas } from "./components/GameCanvas";
import { Board, Shop, Profile, Guide } from "./features/Community";
import { useUI } from "./stores/ui";
export default function App() {
  const { modal, nearby, ready, open } = useUI();
  const { root, expanded, toggle } = useFullscreen();
  return (
    <div ref={root} className={`app${expanded ? " is-fullscreen" : ""}`}>
      <header className="header">
        <a className="brand" href="./">
          <span className="brand-icon">▟</span>
          <span>
            CHZ <b>Cat Town</b>
            <small>A LITTLE PLACE TO BELONG</small>
          </span>
        </a>
        <div className="header-right">
          <span className="version">3D PREVIEW v0.2</span>
          <span className="divider" />
          <button className="user-button" onClick={() => open("profile")}>
            <span className="avatar">🐈</span>CHZ
            <span className="user-dot" />
          </button>
          <button
            className="help-button"
            aria-label="이용 안내"
            onClick={() => open("guide")}
          >
            ?
          </button>
        </div>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <span className="eyebrow">YOUR COZY CORNER OF THE INTERNET</span>
            <h1>
              오늘도, 고양이 마을 <span>✳</span>
            </h1>
            <p>가벼운 발걸음으로 산책하고, 작은 이야기를 만나세요.</p>
          </div>
          <div className="town-status">
            <span /> 포근한 작은 마을 <span className="status-weather">3D</span>
          </div>
        </div>
        <section
          className="town-frame"
          aria-label="플레이 가능한 3D 고양이 마을"
        >
          <GameCanvas />
          <div className="town-tools">
            <button onClick={() => open("profile")}>고양이 선택</button>
            <button aria-pressed={expanded} onClick={() => void toggle()}>
              {expanded ? "전체화면 나가기" : "전체화면"} ⛶
            </button>
          </div>
          <div className="map-label">
            <span className="map-symbol">⌘</span>
            <div>
              치즈 마을<small>COZY 3D VILLAGE · 01</small>
            </div>
          </div>
          <div className="session-label">
            <span /> 나만의 산책 <small>LOCAL</small>
          </div>
          <div className="welcome">
            <span className="eyebrow">TAKE A LITTLE WALK</span>
            <strong>어서 와요, CHZ!</strong>
            <p>이곳에서 당신의 이야기를 시작해요.</p>
          </div>
          {!ready && <div className="loading">마을의 문을 여는 중…</div>}
          {nearby && !modal && (
            <div className="interaction" role="status">
              <kbd>E</kbd>
              {nearby.label}
            </div>
          )}
          <div className="map-caption">
            CHZ CAT TOWN <span>작은 마을, 함께할 이야기.</span>
          </div>
        </section>
        <div className="below-map">
          <div className="controls">
            <span>
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd> 이동 <i>또는 방향키</i>
            </span>
            <span>
              <kbd>E</kbd> 상호작용
            </span>
            <span>
              <kbd>ESC</kbd> 창 닫기
            </span>
          </div>
          <button onClick={() => open("guide")}>
            처음 오셨나요? <span>↗</span>
          </button>
        </div>
        <div className="destination-strip">
          <div>
            <span className="destination-icon">▤</span>
            <div>
              <strong>Cat Board</strong>
              <p>마을의 이야기가 모이는 곳</p>
            </div>
            <span className="destination-direction">광장 북쪽</span>
          </div>
          <div>
            <span className="destination-icon">⌂</span>
            <div>
              <strong>Cat Shop</strong>
              <p>소소한 즐거움을 발견해요</p>
            </div>
            <span className="destination-direction">광장 동쪽</span>
          </div>
          <div>
            <span className="destination-icon">♧</span>
            <div>
              <strong>Cat House</strong>
              <p>가장 나다운, 포근한 공간</p>
            </div>
            <span className="destination-direction">마을 북쪽</span>
          </div>
        </div>
      </main>
      <footer className="page-footer">
        <span>
          CHZ Cat Town <span>© 2026</span>
        </span>
        <span>
          조금 느려도 괜찮은 곳. <span>🐾</span>
        </span>
      </footer>
      {modal === "board" ? (
        <Board />
      ) : modal === "shop" ? (
        <Shop />
      ) : modal === "profile" ? (
        <Profile />
      ) : modal === "guide" ? (
        <Guide />
      ) : null}
    </div>
  );
}
