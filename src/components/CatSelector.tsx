import { CAT_TYPES, type CatType } from "../game/config/cats";
import { useAppearance } from "../stores/appearance";
export function CatPreview({ type }: { type: CatType }) {
  const cat = CAT_TYPES.find((c) => c.id === type)!;
  return (
    <svg
      viewBox="0 0 24 32"
      width="48"
      height="64"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path fill={cat.dark} d="M4 5h5v8h6V5h5v16h-1v7H5V21H4z" />
      <path fill={cat.base} d="M4 11h16v10H4zM7 21h10v6H7zM2 20h3v7H2z" />
      <path fill="#e9a3a1" d="M5 6h3v4H5zM16 6h3v4h-3z" />
      {type === "calico" ? (
        <>
          <path fill={cat.mark} d="M4 11h6v7H4zM14 22h4v4h-4z" />
          <path fill="#424148" d="M15 10h5v8h-5z" />
        </>
      ) : type === "tuxedo" ? (
        <path fill={cat.mark} d="M9 19h6v8H9zM7 26h4v3H7zM14 26h4v3h-4z" />
      ) : (
        <path fill={cat.mark} d="M10 10h2v4h-2zM14 10h2v3h-2z" />
      )}
      {type === "tabby" && (
        <path
          fill={cat.mark}
          d="M5 21h4v2H5zM15 23h4v2h-4zM4 17h3v2H4zM17 17h3v2h-3z"
        />
      )}
      <path fill={cat.eyes} d="M8 15h2v3H8zM15 15h2v3h-2z" />
      <path fill="#b56d61" d="M11 19h3v2h-3z" />
      <path fill="#fff0cd" d="M9 21h6v2H9z" />
    </svg>
  );
}
export function CatSelector() {
  const { catType, select } = useAppearance();
  return (
    <section className="cat-selector" aria-label="고양이 선택">
      <h3>어떤 고양이로 산책할까요?</h3>
      <p>선택하면 바로 적용되고, 다음 방문에도 기억해요.</p>
      <div className="cat-options">
        {CAT_TYPES.map((cat) => (
          <button
            key={cat.id}
            className="cat-option"
            aria-pressed={catType === cat.id}
            onClick={() => select(cat.id)}
          >
            <CatPreview type={cat.id} />
            <span>{cat.name}</span>
            <small>{catType === cat.id ? "선택됨" : "선택하기"}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
