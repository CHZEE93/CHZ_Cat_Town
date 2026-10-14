import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Modal } from "../../components/Modal";
import { townService } from "../../api/townService";
import { errorMessage } from "../../api/client";
import { useAuth } from "../../stores/auth";
import { useUI } from "../../stores/ui";
import { AuthPrompt } from "../auth/AuthModal";
export function Shop() {
  const user = useAuth((s) => s.user);
  return <ShopContent key={user?.id ?? "guest"} />;
}
function ShopContent() {
  const user = useAuth((s) => s.user);
  const client = useQueryClient();
  const products = useQuery({
    queryKey: ["products"],
    queryFn: townService.products,
  });
  const wallet = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: townService.wallet,
    enabled: !!user,
  });
  const inventory = useQuery({
    queryKey: ["inventory", user?.id],
    queryFn: townService.inventory,
    enabled: !!user,
  });
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const keys = useRef(new Map<number, string>());
  async function buy(productId: number) {
    if (!user || busy !== null) return;
    setBusy(productId);
    setError("");
    setMessage("");
    const storageKey = `chz-purchase-${user.id}-${productId}`;
    let key = keys.current.get(productId);
    try {
      key ??= sessionStorage.getItem(storageKey) ?? undefined;
    } catch {
      /* Retain in memory. */
    }
    key ??= crypto.randomUUID();
    keys.current.set(productId, key);
    try {
      sessionStorage.setItem(storageKey, key);
    } catch {
      /* Retain in memory. */
    }
    try {
      const result = await townService.purchase(productId, key);
      client.setQueryData(["wallet", user.id], { balance: result.balance });
      setMessage("구매 완료! 내 옷장에서 장착해 보세요.");
      keys.current.delete(productId);
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        /* Successful requests are also safe to replay. */
      }
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["wallet", user.id] }),
        client.invalidateQueries({ queryKey: ["inventory", user.id] }),
        client.invalidateQueries({ queryKey: ["transactions", user.id] }),
      ]);
      setBusy(null);
    }
  }
  return (
    <Modal
      title="Cat Shop"
      eyebrow="작은 취향을 모으는 곳"
      busy={busy !== null}
    >
      <p className="muted">
        산책에 작은 취향을 더해 보세요. 각 아이템은 한 번씩 구매할 수 있어요.
      </p>
      {user ? (
        <div className="wallet-bar">
          <span>
            내 코인{" "}
            <strong data-testid="wallet-balance">
              {wallet.data?.balance.toLocaleString() ?? "…"}
            </strong>
          </span>
          <button
            className="secondary-button"
            disabled={busy !== null}
            onClick={() => useUI.getState().open("profile")}
          >
            내 옷장 ↗
          </button>
        </div>
      ) : (
        <AuthPrompt />
      )}
      {(wallet.isError || inventory.isError) && (
        <div className="notice" role="alert">
          내 정보를 불러오지 못했어요.{" "}
          <button
            onClick={() => {
              void wallet.refetch();
              void inventory.refetch();
            }}
          >
            다시 불러오기
          </button>
        </div>
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
      {products.isPending ? (
        <p>상품을 불러오는 중…</p>
      ) : products.isError ? (
        <div role="alert">
          {errorMessage(products.error)}{" "}
          <button onClick={() => void products.refetch()}>다시 불러오기</button>
        </div>
      ) : (
        <div className="products">
          {products.data.map((product) => {
            const owned = inventory.data?.some(
              (item) => item.id === product.item.id,
            );
            const insufficient =
              !!wallet.data && wallet.data.balance < product.price;
            return (
              <article className="product" key={product.id}>
                <div className="product-icon">{product.item.icon}</div>
                <h3>{product.item.name}</h3>
                <p>{product.item.description}</p>
                <span className="price">
                  ● {product.price} <small>Coin</small>
                </span>
                <button
                  className="secondary-button"
                  disabled={
                    !!user &&
                    (busy !== null ||
                      owned ||
                      insufficient ||
                      !wallet.data ||
                      !inventory.data)
                  }
                  onClick={() =>
                    user ? void buy(product.id) : useUI.getState().open("auth")
                  }
                  aria-label={`${product.item.name} ${owned ? "보유 중" : "구매"}`}
                >
                  {busy === product.id
                    ? "구매 중…"
                    : owned
                      ? "보유 중"
                      : !user
                        ? "로그인 후 구매"
                        : insufficient
                          ? "코인 부족"
                          : "구매하기"}
                </button>
              </article>
            );
          })}
        </div>
      )}
      <div className="notice">
        가입 선물과 출석·산책·배달로 코인을 모아보세요.
      </div>
    </Modal>
  );
}
