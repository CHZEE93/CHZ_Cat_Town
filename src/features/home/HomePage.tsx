import { useQuery } from "@tanstack/react-query";
import { townService } from "../../api/townService";
import { useUI } from "../../stores/ui";
import { useAppearance } from "../../stores/appearance";
import { CAT_TYPES } from "../../game/config/cats";
import { CatPreview } from "../../components/CatSelector";
import { useAuth } from "../../stores/auth";
import { AuthPrompt } from "../auth/AuthModal";
import { RewardsCard } from "../rewards/Rewards";
function WelcomeIllustration() {
  return (
    <svg className="welcome-art" viewBox="0 0 440 280" aria-hidden="true">
      <ellipse cx="222" cy="240" rx="177" ry="21" fill="#ced7b7" />
      <path d="M26 173L229 86L421 164L228 260Z" fill="#cbd7af" />
      <path d="M26 173V187L228 274V260Z" fill="#b4c297" />
      <path d="M228 260L421 164V179L228 274Z" fill="#a1b18b" />
      <path d="M162 166L213 143L304 186L255 210Z" fill="#f2e6c8" />
      <path d="M162 166L255 210L228 223L134 179Z" fill="#f2e6c8" />
      <path d="M147 115L213 88L283 117V182L217 212L147 180Z" fill="#f7e8c8" />
      <path d="M217 144L283 117V182L217 212Z" fill="#e4d5b4" />
      <path d="M126 120L178 60L257 84L302 120L217 156Z" fill="#bb826d" />
      <path d="M178 60L217 156L126 120Z" fill="#d89c81" />
      <path d="M177 60L257 84L302 120L217 156Z" fill="#c78d73" />
      <path d="M163 141L183 149V174L163 166Z" fill="#98b9b1" />
      <path d="M191 160L207 167V204L191 197Z" fill="#a28765" />
      <path d="M235 163L254 154V177L235 186Z" fill="#9cbdb6" />
      {[
        [85, 156],
        [346, 144],
        [316, 204],
      ].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <path d="M-4 0V-42H5V0Z" fill="#a08761" />
          <path d="M-29-43L-18-76L10-87L33-60L19-28L-9-25Z" fill="#9bb57e" />
          <path d="M10-87L33-60L19-28L0-48Z" fill="#7e9c6d" />
          <path d="M-29-43L-18-76L0-48L-9-25Z" fill="#b1c68e" />
        </g>
      ))}
      <g transform="translate(191 236)">
        <ellipse cy="5" rx="16" ry="5" fill="#adbb94" />
        <path d="M-12 0V-13L-7-23L-2-17L5-17L10-23L14-13V0Z" fill="#e2ae68" />
        <circle cx="-5" cy="-9" r="1.5" fill="#65513c" />
        <circle cx="7" cy="-9" r="1.5" fill="#65513c" />
        <path d="M0-5H3L1-3Z" fill="#b57669" />
      </g>
      <path
        d="M325 61V74M319 68H332M103 65V77M97 71H109"
        stroke="#b9c59e"
        strokeWidth="2"
      />
    </svg>
  );
}
export function HomePage() {
  const open = useUI((s) => s.open);
  const catType = useAppearance((s) => s.catType);
  const user = useAuth((s) => s.user);
  const wallet = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: townService.wallet,
    enabled: !!user,
  });
  const cat = CAT_TYPES.find((c) => c.id === catType)!;
  const {
    data: posts,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: ({ signal }) => townService.posts(signal),
  });
  return (
    <main className="home-page" id="main-content" tabIndex={-1}>
      <div className="home-heading">
        <span className="eyebrow">YOUR COZY CORNER</span>
        <h1>
          다시 만나서 반가워요, {user?.nickname ?? "여행자"} <span>✳</span>
        </h1>
        <p>잠깐 쉬어가도 좋아요. 오늘의 작은 이야기는 여기서 시작해요.</p>
      </div>
      <section className="welcome-hero">
        <div className="hero-copy">
          <span className="pill">A LITTLE PLACE TO BELONG</span>
          <h2>
            바쁜 하루에서 한 걸음,
            <br />
            우리 마을로 놀러 오세요.
          </h2>
          <p>
            고양이가 되어 걷고, 이웃의 이야기를 만나고.
            <br />
            정해진 목표 없이 나만의 속도로 둘러보세요.
          </p>
          <a className="primary-button" href="#/game">
            마을 입장하기 <span aria-hidden="true">↗</span>
          </a>
          <small>WASD로 산책 · E로 이야기 만나기</small>
        </div>
        <WelcomeIllustration />
      </section>
      {!user && <AuthPrompt />}
      <RewardsCard />
      <div className="dashboard-grid">
        <section className="dashboard-card stories-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">FROM THE NEIGHBORHOOD</span>
              <h2>마을 이야기</h2>
            </div>
            <button onClick={() => open("board")} aria-label="게시판 전체 보기">
              전체 보기 ↗
            </button>
          </div>
          <p className="card-description">
            이웃들이 남긴 소소한 안부를 만나보세요.
          </p>
          {isPending ? (
            <p className="muted">이야기를 불러오는 중…</p>
          ) : isError ? (
            <p className="muted">이야기를 불러오지 못했어요.</p>
          ) : (
            <div className="home-posts">
              {!posts?.items.length && (
                <p className="empty-state">
                  아직 이야기가 없어요. 첫 인사를 남겨 주세요.
                </p>
              )}
              {posts?.items.slice(0, 3).map((post) => (
                <button key={post.id} onClick={() => open("board")}>
                  <span className="story-avatar" aria-hidden="true">
                    {post.author.slice(0, 1)}
                  </span>
                  <span>
                    <strong>{post.title}</strong>
                    <small>
                      {post.author} · {post.category}
                    </small>
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="dashboard-card resident-card">
          <span className="eyebrow">MY LITTLE NEIGHBOR</span>
          <h2>오늘의 나</h2>
          <div className="home-cat">
            <CatPreview type={catType} />
          </div>
          <h3>{user?.nickname ?? "여행자"}</h3>
          <p>{cat.name} · 가벼운 산책 준비 완료</p>
          <button className="secondary-button" onClick={() => open("profile")}>
            내 고양이 보기 <span>↗</span>
          </button>
          {user && (
            <p className="home-wallet">
              내 코인 · {wallet.data?.balance.toLocaleString() ?? "…"}
            </p>
          )}
          <button className="text-button" onClick={() => open("shop")}>
            상점 둘러보기 ↗
          </button>
        </section>
      </div>
      <section className="coming-home">
        <div>
          <span className="eyebrow">GROWING TOGETHER</span>
          <h2>홈도, 마을과 함께 자라나요.</h2>
          <p>앞으로 이곳에서 만나볼 소식들이에요.</p>
        </div>
        <div className="future-items">
          <span>
            마을 공지 <small>준비 중</small>
          </span>
          <span>
            나의 최근 활동 <small>준비 중</small>
          </span>
          <span>
            함께하는 모임 <small>준비 중</small>
          </span>
        </div>
      </section>
      <footer className="home-footer">
        CHZ Cat Town <span>조금 느려도 괜찮은 곳.</span>
      </footer>
    </main>
  );
}
