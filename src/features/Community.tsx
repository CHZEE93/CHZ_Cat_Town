import { CatSelector, CatPreview } from "../components/CatSelector";
import { useAppearance } from "../stores/appearance";
import { CAT_TYPES } from "../game/config/cats";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { townService } from "../api/townService";
import { Modal } from "../components/Modal";
export function Board() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: townService.posts,
  });
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <Modal title="Cat Board" eyebrow="마을의 작은 이야기">
      <p className="muted">안부를 나누고, 우리 마을의 하루를 만나보세요.</p>
      {isPending ? (
        <p>불러오는 중…</p>
      ) : isError ? (
        <p>게시글을 불러오지 못했어요.</p>
      ) : (
        <div className="posts">
          {data?.map((post) => (
            <button
              className="post"
              key={post.id}
              onClick={() => setSelected(selected === post.id ? null : post.id)}
              aria-expanded={selected === post.id}
            >
              <span className="tag">{post.category}</span>
              <strong>{post.title}</strong>
              <span className="post-meta">
                {post.author} · {post.time}
              </span>
              {selected === post.id && <p>{post.body}</p>}
            </button>
          ))}
        </div>
      )}
      <div className="notice">
        미리보기 게시판이에요. 글 작성은 다음 버전에서 만나요.
      </div>
    </Modal>
  );
}
export function Shop() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["products"],
    queryFn: townService.products,
  });
  return (
    <Modal title="Cat Shop" eyebrow="작은 취향을 모으는 곳">
      <p className="muted">고양이의 하루를 조금 더 포근하게.</p>
      {isPending ? (
        <p>불러오는 중…</p>
      ) : isError ? (
        <p>상품을 불러오지 못했어요.</p>
      ) : (
        <div className="products">
          {data?.map((item) => (
            <article className="product" key={item.id}>
              <div className="product-icon">{item.icon}</div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <span className="price">
                ● {item.price} <small>Coin</small>
              </span>
            </article>
          ))}
        </div>
      )}
      <div className="notice">
        진열 상품 미리보기 · 구매 기능은 아직 준비 중이에요.
      </div>
    </Modal>
  );
}
export function Profile() {
  const catType = useAppearance((s) => s.catType);
  const { data, isPending, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: townService.profile,
  });
  return (
    <Modal title="My little home" eyebrow="반가워요, 이웃 고양이">
      <div className="profile-cat">
        <CatPreview type={catType} />
      </div>
      {isPending ? (
        <p>불러오는 중…</p>
      ) : isError ? (
        <p>프로필을 불러오지 못했어요.</p>
      ) : (
        data && (
          <>
            <h3 className="profile-name">
              {data.nickname} <span>마을 주민</span>
            </h3>
            <dl>
              <div>
                <dt>Nickname</dt>
                <dd>{data.nickname}</dd>
              </div>
              <div>
                <dt>Cat Type</dt>
                <dd>{CAT_TYPES.find((cat) => cat.id === catType)!.english}</dd>
              </div>
              <div>
                <dt>Town Since</dt>
                <dd>{data.since}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{data.status}</dd>
              </div>
            </dl>
          </>
        )
      )}
      <CatSelector />
      <div className="notice">
        MVP 샘플 프로필 · 나만의 이야기가 시작되는 곳.
      </div>
    </Modal>
  );
}
export function Guide() {
  return (
    <Modal title="천천히, 둘러보세요" eyebrow="WELCOME TO THE NEIGHBORHOOD">
      <p className="muted">정해진 목표도, 서두를 이유도 없어요.</p>
      <div className="guide-row">
        <kbd>W A S D</kbd>
        <span>또는 방향키로 화면 방향에 맞춰 걸어요.</span>
      </div>
      <div className="guide-row">
        <kbd>E</kbd>
        <span>게시판, 상점, 집 앞에서 상호작용해요.</span>
      </div>
      <div className="guide-row">
        <kbd>ESC</kbd>
        <span>창을 닫고 다시 산책해요.</span>
      </div>
      <div className="notice">
        키보드가 있는 데스크톱 브라우저에 맞춘 싱글 플레이 프로토타입입니다.
      </div>
    </Modal>
  );
}
