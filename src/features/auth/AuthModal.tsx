import { useState, type FormEvent } from "react";
import { Modal } from "../../components/Modal";
import { townService } from "../../api/townService";
import { errorMessage } from "../../api/client";
import { useAuth } from "../../stores/auth";
import { useAppearance } from "../../stores/appearance";
import { useUI } from "../../stores/ui";
export function AuthPrompt() {
  const { loading, error, refresh } = useAuth();
  return (
    <div className="notice">
      {loading ? (
        "계정을 확인하는 중…"
      ) : (
        <>
          <p>
            {error ?? "로그인하면 나의 이야기와 고양이를 저장할 수 있어요."}
          </p>
          <button
            className="secondary-button"
            onClick={() => useUI.getState().open("auth")}
          >
            로그인 / 회원가입
          </button>
          {error && (
            <button className="text-button" onClick={() => void refresh()}>
              연결 다시 확인
            </button>
          )}
        </>
      )}
    </div>
  );
}
export function AuthModal() {
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const session = signup
        ? await townService.signup(
            email,
            password,
            nickname.trim(),
            useAppearance.getState().catType,
          )
        : await townService.login(email, password);
      useAuth.getState().accept(session);
      useUI.getState().open("profile");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={signup ? "마을 주민이 되어볼까요?" : "다시 만나서 반가워요"}
      eyebrow="YOUR LITTLE ACCOUNT"
      busy={busy}
    >
      <div className="account-tabs">
        <button
          aria-pressed={!signup}
          disabled={busy}
          onClick={() => {
            setSignup(false);
            setError("");
          }}
        >
          로그인
        </button>
        <button
          aria-pressed={signup}
          disabled={busy}
          onClick={() => {
            setSignup(true);
            setError("");
          }}
        >
          회원가입
        </button>
      </div>
      <form className="town-form" onSubmit={submit}>
        <label>
          이메일
          <input
            type="email"
            autoComplete="username"
            maxLength={254}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            aria-label="비밀번호"
            aria-describedby="password-help"
            autoComplete={signup ? "new-password" : "current-password"}
            minLength={10}
            maxLength={128}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
          />
          <small id="password-help">10~128자</small>
        </label>
        {signup && (
          <label>
            닉네임
            <input
              required
              maxLength={24}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={busy}
            />
          </label>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="primary-button"
          disabled={busy || (signup && !nickname.trim())}
        >
          {busy ? "처리 중…" : signup ? "가입하고 시작하기" : "로그인하기"}
        </button>
      </form>
      <p className="notice">
        가입 선물로 테스트 코인 1,000개를 드려요. 현금 결제 없이 마을 상점에서
        사용할 수 있어요.
      </p>
    </Modal>
  );
}
