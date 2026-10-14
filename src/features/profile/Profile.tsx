import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CatPreview, CatSelector } from "../../components/CatSelector";
import { CatSizeControl } from "../../components/CatSizeControl";
import { Modal } from "../../components/Modal";
import { CAT_TYPES } from "../../game/config/cats";
import { townService } from "../../api/townService";
import { ApiError, errorMessage } from "../../api/client";
import { useAuth } from "../../stores/auth";
import { useAppearance } from "../../stores/appearance";
import { useUI } from "../../stores/ui";
import { AuthPrompt } from "../auth/AuthModal";
import type { Character, Slot, User } from "../../types/api";
const WardrobePreview = lazy(() => import("./WardrobePreview"));
class PreviewBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p>
        3D 미리보기를 표시할 수 없어요. 외형 선택과 저장은 사용할 수 있어요.
      </p>
    ) : (
      this.props.children
    );
  }
}
const slotNames: Record<Slot, string> = {
  head: "머리",
  neck: "목",
  back: "등",
};
export function Profile() {
  const { user, loading } = useAuth();
  const catType = useAppearance((s) => s.catType);
  const scale = useAppearance((s) => s.scale);
  if (!user)
    return (
      <Modal title="My little home" eyebrow="반가워요, 이웃 고양이">
        <div className="profile-cat">
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center bottom",
            }}
          >
            <CatPreview type={catType} />
          </div>
        </div>
        <h3>{CAT_TYPES.find((cat) => cat.id === catType)!.english}</h3>
        <AuthPrompt />
        {!loading && (
          <CatSizeControl
            value={scale}
            onChange={useAppearance.getState().selectSize}
          />
        )}
        {!loading && <CatSelector />}
      </Modal>
    );
  return <ResidentProfile key={user.id} user={user} />;
}
function ResidentProfile({ user }: { user: User }) {
  const client = useQueryClient();
  const [nickname, setNickname] = useState(user.nickname);
  const [bio, setBio] = useState(user.bio);
  const [draft, setDraft] = useState<Character>(
    () => useAppearance.getState().saved,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [conflict, setConflict] = useState(false);
  const inventory = useQuery({
    queryKey: ["inventory", user.id],
    queryFn: townService.inventory,
  });
  const wallet = useQuery({
    queryKey: ["wallet", user.id],
    queryFn: townService.wallet,
  });
  const transactions = useQuery({
    queryKey: ["transactions", user.id],
    queryFn: townService.transactions,
  });
  useEffect(() => () => useAppearance.getState().resetPreview(), []);
  function preview(value: Character) {
    setDraft(value);
    useAppearance.getState().preview(value);
    setMessage("");
  }
  function cancel() {
    setDraft(useAppearance.getState().saved);
    useAppearance.getState().resetPreview();
    setMessage("저장한 모습으로 되돌렸어요.");
    setError("");
  }
  async function saveAppearance() {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const saved = await townService.updateCharacter(draft);
      if (useAuth.getState().user?.id === user.id) {
        useAppearance.getState().apply(saved);
        setDraft(saved);
        setMessage("고양이 외형을 저장했어요.");
        setConflict(false);
      }
    } catch (error) {
      setError(errorMessage(error));
      if (error instanceof ApiError && error.status === 409) setConflict(true);
    } finally {
      setBusy(false);
    }
  }
  async function reloadAppearance() {
    setBusy(true);
    setError("");
    try {
      const saved = await townService.character();
      if (useAuth.getState().user?.id === user.id) {
        useAppearance.getState().apply(saved);
        setDraft(saved);
        setConflict(false);
      }
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const updated = await townService.updateProfile(
        nickname.trim(),
        bio.trim(),
      );
      if (useAuth.getState().user?.id === user.id)
        useAuth.getState().updateUser(updated);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["posts"] }),
        client.invalidateQueries({ queryKey: ["board"] }),
      ]);
      setMessage("프로필을 저장했어요.");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      await townService.logout();
      useAuth
        .getState()
        .accept({ user: null, csrfToken: null, character: null });
      useUI.getState().open(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401)
        useAuth.getState().expire();
      else setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title="My little home"
      eyebrow={`${user.nickname}의 작은 옷장`}
      busy={busy}
    >
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
      <div className="wardrobe-preview">
        <PreviewBoundary>
          <Suspense fallback={<p>고양이를 데려오는 중…</p>}>
            <WardrobePreview character={draft} />
          </Suspense>
        </PreviewBoundary>
      </div>
      <p className="preview-caption">
        드래그해서 돌려보세요 · 저장 전까지는 미리보기예요.
      </p>
      <CatSizeControl
        value={draft.scale}
        disabled={busy}
        onChange={(scale) => preview({ ...draft, scale })}
      />
      <CatSelector
        value={draft.catType}
        disabled={busy}
        onChange={(catType) => preview({ ...draft, catType })}
      />
      <section className="wardrobe">
        <div className="card-heading">
          <h3>내 옷장</h3>
          <button disabled={busy} onClick={() => useUI.getState().open("shop")}>
            상점 둘러보기 ↗
          </button>
        </div>
        {inventory.isPending ? (
          <p>옷장을 여는 중…</p>
        ) : inventory.isError ? (
          <p role="alert">
            {errorMessage(inventory.error)}{" "}
            <button onClick={() => void inventory.refetch()}>
              다시 불러오기
            </button>
          </p>
        ) : (
          <>
            {!inventory.data.length && (
              <p className="empty-state">
                아직 소품이 없어요. 상점에서 첫 아이템을 골라보세요.
              </p>
            )}
            <div className="equipment-slots">
              {(["head", "neck", "back"] as Slot[]).map((slot) => (
                <label key={slot}>
                  {slotNames[slot]}
                  <select
                    aria-label={slotNames[slot]}
                    disabled={busy}
                    value={draft.equipped[slot] ?? ""}
                    onChange={(e) =>
                      preview({
                        ...draft,
                        equipped: {
                          ...draft.equipped,
                          [slot]: e.target.value || null,
                        },
                      })
                    }
                  >
                    <option value="">장착 안 함</option>
                    {inventory.data
                      .filter((item) => item.slot === slot)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.icon} {item.name}
                        </option>
                      ))}
                  </select>
                </label>
              ))}
            </div>
          </>
        )}
        <div className="form-actions">
          <button
            className="primary-button"
            disabled={busy || conflict}
            onClick={() => void saveAppearance()}
          >
            외형 저장
          </button>
          <button className="secondary-button" disabled={busy} onClick={cancel}>
            변경 취소
          </button>
          {conflict && (
            <button
              className="secondary-button"
              disabled={busy}
              onClick={() => void reloadAppearance()}
            >
              저장된 외형 다시 불러오기
            </button>
          )}
        </div>
      </section>
      <form className="town-form profile-form" onSubmit={saveProfile}>
        <h3>주민 정보</h3>
        <p className="muted">
          {user.email} · {new Date(user.createdAt).toLocaleDateString("ko-KR")}{" "}
          가입
        </p>
        <label>
          닉네임
          <input
            required
            maxLength={24}
            disabled={busy}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>
        <label>
          자기소개
          <textarea
            rows={3}
            maxLength={300}
            disabled={busy}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>
        <button
          className="secondary-button"
          disabled={busy || !nickname.trim()}
        >
          프로필 저장
        </button>
      </form>
      <section className="coin-history">
        <h3>내 코인 · {wallet.data?.balance.toLocaleString() ?? "…"}</h3>
        {wallet.isError && (
          <p role="alert">
            잔액을 불러오지 못했어요.{" "}
            <button onClick={() => void wallet.refetch()}>
              잔액 다시 불러오기
            </button>
          </p>
        )}
        {transactions.isPending ? (
          <p>거래내역을 불러오는 중…</p>
        ) : transactions.isError ? (
          <p role="alert">
            거래내역을 불러오지 못했어요.{" "}
            <button onClick={() => void transactions.refetch()}>
              다시 불러오기
            </button>
          </p>
        ) : (
          <ul>
            {transactions.data.slice(0, 5).map((entry) => (
              <li key={entry.id}>
                <span>
                  {entry.reason === "signup" ? "가입 선물" : "상점 구매"}
                  <small>
                    {new Date(entry.createdAt).toLocaleDateString("ko-KR")}
                  </small>
                </span>
                <strong>
                  {entry.amount > 0 ? "+" : ""}
                  {entry.amount}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
      <button
        className="text-button"
        disabled={busy}
        onClick={() => void logout()}
      >
        로그아웃
      </button>
    </Modal>
  );
}
