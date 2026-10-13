import { useState, type FormEvent } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { townService } from "../../api/townService";
import { errorMessage } from "../../api/client";
import { useAuth } from "../../stores/auth";
import { AuthPrompt } from "../auth/AuthModal";
import type { Post, PostInput } from "../../types/api";
const emptyPost = (): PostInput => ({ title: "", body: "", category: "일상" });
export function Board() {
  const user = useAuth((s) => s.user);
  return <BoardContent key={user?.id ?? "guest"} />;
}
function BoardContent() {
  const user = useAuth((s) => s.user);
  const client = useQueryClient();
  const query = useInfiniteQuery({
    queryKey: ["board"],
    initialPageParam: undefined as number | undefined,
    queryFn: ({ signal, pageParam }) => townService.posts(signal, pageParam),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
  const [selected, setSelected] = useState<number | null>(null);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<PostInput>(emptyPost);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  async function refresh() {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["board"] }),
      client.invalidateQueries({ queryKey: ["posts"] }),
    ]);
  }
  function edit(post?: Post) {
    setEditing(post?.id ?? "new");
    setDraft(
      post
        ? { title: post.title, body: post.body, category: post.category }
        : emptyPost(),
    );
    setError("");
    setMessage("");
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (busy || editing === null) return;
    setBusy(true);
    setError("");
    try {
      const data = {
        ...draft,
        title: draft.title.trim(),
        body: draft.body.trim(),
      };
      if (editing === "new") await townService.createPost(data);
      else await townService.updatePost(editing, data);
      setEditing(null);
      setMessage("이야기를 저장했어요.");
      await refresh();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function remove(id: number) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await townService.deletePost(id);
      setDeleting(null);
      setSelected(null);
      setMessage("이야기를 삭제했어요.");
      await refresh();
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Cat Board" eyebrow="마을의 작은 이야기" busy={busy}>
      <p className="muted">안부를 나누고, 우리 마을의 하루를 만나보세요.</p>
      {!user ? (
        <AuthPrompt />
      ) : (
        editing === null && (
          <button className="primary-button" onClick={() => edit()}>
            글쓰기
          </button>
        )
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="form-success" role="status">
          {message}
        </p>
      )}
      {editing !== null && (
        <form className="town-form post-editor" onSubmit={save}>
          <h3>{editing === "new" ? "새 이야기" : "이야기 수정"}</h3>
          <label>
            분류
            <select
              value={draft.category}
              disabled={busy}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  category: e.target.value as PostInput["category"],
                })
              }
            >
              {["인사", "일상", "모임"].map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label>
            제목
            <input
              required
              maxLength={120}
              value={draft.title}
              disabled={busy}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </label>
          <label>
            내용
            <textarea
              required
              rows={6}
              maxLength={10000}
              value={draft.body}
              disabled={busy}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </label>
          <div className="form-actions">
            <button
              className="primary-button"
              disabled={busy || !draft.title.trim() || !draft.body.trim()}
            >
              {busy ? "저장 중…" : "게시글 저장"}
            </button>
            <button
              type="button"
              className="secondary-button"
              disabled={busy}
              onClick={() => setEditing(null)}
            >
              취소
            </button>
          </div>
        </form>
      )}
      {query.isPending ? (
        <p>불러오는 중…</p>
      ) : query.isError ? (
        <div className="notice" role="alert">
          {errorMessage(query.error)}{" "}
          <button onClick={() => void query.refetch()}>다시 불러오기</button>
        </div>
      ) : (
        <div className="posts">
          {!query.data.pages[0].items.length && (
            <p className="empty-state">
              아직 이야기가 없어요. 첫 인사를 남겨 주세요.
            </p>
          )}
          {query.data.pages
            .flatMap((page) => page.items)
            .map((post) => (
              <article className="board-post" key={post.id}>
                <button
                  className="post"
                  onClick={() => {
                    setSelected(selected === post.id ? null : post.id);
                    setDeleting(null);
                  }}
                  aria-expanded={selected === post.id}
                >
                  <span className="tag">{post.category}</span>
                  <strong>{post.title}</strong>
                  <span className="post-meta">
                    {post.author} ·{" "}
                    {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </button>
                {selected === post.id && (
                  <div className="post-detail">
                    <p className="post-body">{post.body}</p>
                    {user?.id === post.authorId && (
                      <div className="form-actions">
                        <button
                          className="secondary-button"
                          disabled={busy}
                          onClick={() => edit(post)}
                        >
                          수정
                        </button>
                        <button
                          className="text-button danger"
                          disabled={busy}
                          onClick={() => setDeleting(post.id)}
                        >
                          삭제
                        </button>
                      </div>
                    )}
                    {deleting === post.id && (
                      <div className="notice">
                        <p>이 이야기를 삭제할까요?</p>
                        <button
                          className="danger"
                          disabled={busy}
                          onClick={() => void remove(post.id)}
                        >
                          삭제 확인
                        </button>{" "}
                        <button
                          disabled={busy}
                          onClick={() => setDeleting(null)}
                        >
                          유지하기
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          {query.hasNextPage && (
            <button
              className="secondary-button"
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
            >
              이전 이야기 더 보기
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
