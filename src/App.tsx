import { useEffect, useState } from "react";
import { usePage } from "./app/usePage";
import { Sidebar } from "./components/Sidebar";
import { HomePage } from "./features/home/HomePage";
import { GamePage } from "./components/GamePage";
import { useFullscreen } from "./components/useFullscreen";
import { Board, Shop, Profile, Guide } from "./features/Community";
import { useUI } from "./stores/ui";
import { AuthModal } from "./features/auth/AuthModal";
export default function App() {
  const page = usePage();
  const [sidebarHidden, setSidebarHidden] = useState(() => {
    try {
      return localStorage.getItem("chz-sidebar-hidden") === "true";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("chz-sidebar-hidden", String(sidebarHidden));
    } catch {
      /* The toggle still works when storage is unavailable. */
    }
  }, [sidebarHidden]);
  const [entered, setEntered] = useState(page === "game");
  const { modal, open } = useUI();
  const { root, expanded, toggle, exit } = useFullscreen();
  useEffect(() => {
    open(null);
    if (page === "game") setEntered(true);
    else void exit();
  }, [page, open, exit]);
  return (
    <div
      ref={root}
      className={`app app-shell${sidebarHidden ? " sidebar-collapsed" : ""}${expanded ? " is-fullscreen" : ""}`}
    >
      <button
        className="skip-link"
        inert={modal !== null}
        onClick={() => document.getElementById("main-content")?.focus()}
      >
        본문으로 이동
      </button>
      <Sidebar page={page} hidden={sidebarHidden} />
      <div className="workspace" inert={modal !== null}>
        <header className="workspace-header">
          <div className="workspace-heading">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarHidden((value) => !value)}
              aria-controls="town-sidebar"
              aria-expanded={!sidebarHidden}
              aria-label={
                sidebarHidden ? "사이드메뉴 펼치기" : "사이드메뉴 숨기기"
              }
              title={sidebarHidden ? "사이드메뉴 펼치기" : "사이드메뉴 숨기기"}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="16" rx="3" />
                <path d="M9 4v16" />
                <path d={sidebarHidden ? "m13 9 3 3-3 3" : "m17 9-3 3 3 3"} />
              </svg>
            </button>
            <span className="breadcrumb">
              CHZ Cat Town <span>/</span>
            </span>
            <strong>{page === "home" ? "홈" : "게임"}</strong>
          </div>
          <span className="workspace-status">
            <i />
            {page === "home" ? "나만의 작은 쉼터" : "치즈 마을 · 나만의 산책"}
          </span>
        </header>
        {page === "home" && <HomePage />}
        {(entered || page === "game") && (
          <GamePage
            active={page === "game"}
            expanded={expanded}
            onFullscreen={() => void toggle()}
          />
        )}
      </div>
      {modal === "board" ? (
        <Board />
      ) : modal === "shop" ? (
        <Shop />
      ) : modal === "profile" ? (
        <Profile />
      ) : modal === "guide" ? (
        <Guide />
      ) : modal === "auth" ? (
        <AuthModal />
      ) : null}
    </div>
  );
}
