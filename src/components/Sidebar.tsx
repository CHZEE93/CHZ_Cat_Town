import type { Page } from "../app/usePage";
import { useUI } from "../stores/ui";
import { CatPreview } from "./CatSelector";
import { useAppearance } from "../stores/appearance";
import { useAuth } from "../stores/auth";
export function Sidebar({ page, hidden }: { page: Page; hidden: boolean }) {
  const open = useUI((s) => s.open);
  const catType = useAppearance((s) => s.catType);
  const user = useAuth((s) => s.user);
  const modal = useUI((s) => s.modal);
  return (
    <aside
      id="town-sidebar"
      className="sidebar"
      hidden={hidden}
      inert={modal !== null}
    >
      <a href="#/home" className="sidebar-brand" aria-label="CHZ Cat Town 홈">
        <span className="brand-icon">▟</span>
        <span>
          CHZ Cat Town<small>A LITTLE PLACE TO BELONG</small>
        </span>
      </a>
      <div className="nav-caption">MY LITTLE TOWN</div>
      <nav aria-label="주 메뉴">
        <a href="#/home" aria-current={page === "home" ? "page" : undefined}>
          <span aria-hidden="true">⌂</span>
          <b>홈</b>
          <small>Home</small>
        </a>
        <a href="#/game" aria-current={page === "game" ? "page" : undefined}>
          <span aria-hidden="true">♧</span>
          <b>게임</b>
          <small>Town</small>
        </a>
      </nav>
      <div className="sidebar-note">
        <span>조금 느려도 괜찮은 곳.</span>
        <p>
          오늘도 편안한 산책이
          <br />
          기다리고 있어요.
        </p>
        <span className="sidebar-flower" aria-hidden="true">
          ✳
        </span>
      </div>
      <div className="sidebar-bottom">
        <button
          className="sidebar-profile"
          onClick={() => open("profile")}
          aria-label="내 프로필"
        >
          <CatPreview type={catType} />
          <span>
            {user?.nickname ?? "여행자"}
            <small>{user ? "나의 고양이" : "비회원 산책 중"}</small>
          </span>
          <span aria-hidden="true">↗</span>
        </button>
        <button className="sidebar-help" onClick={() => open("guide")}>
          <span aria-hidden="true">?</span> 이용 안내
        </button>
        {!user && (
          <button className="sidebar-help" onClick={() => open("auth")}>
            로그인 / 회원가입
          </button>
        )}
        <small className="sidebar-version">COZY SOCIAL TOWN · v0.3</small>
      </div>
    </aside>
  );
}
