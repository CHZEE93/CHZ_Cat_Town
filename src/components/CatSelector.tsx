import { CAT_TYPES, type CatType } from "../game/config/cats";
import { useAppearance } from "../stores/appearance";
export function CatPreview({ type }: { type: CatType }) {
  const cat = CAT_TYPES.find((c) => c.id === type)!;
  return (
    <svg viewBox="0 0 64 72" width="48" height="64" aria-hidden="true">
      <ellipse cx="32" cy="67" rx="24" ry="4" fill="#7e8761" opacity=".15" />
      <path d="M46 44L56 33L59 22L63 26L60 41L50 55Z" fill={cat.dark} />
      <path d="M18 36L40 32L52 44L49 62L20 62L13 49Z" fill={cat.base} />
      <path d="M40 32L52 44L49 62L39 58Z" fill={cat.dark} opacity=".55" />
      <path
        d="M18 54H27V68H16Z M37 55H46L48 68H36Z"
        fill={type === "tuxedo" ? cat.mark : cat.base}
      />
      <path
        d="M11 21L11 4L24 15L40 15L52 4L53 25L49 42L32 48L15 41L8 30Z"
        fill={cat.base}
      />
      <path
        d="M11 4L16 12L16 22L11 21Z M52 4L53 25L46 22L47 13Z"
        fill={cat.dark}
      />
      <path d="M14 10L22 18L15 21Z M49 10L48 22L41 18Z" fill="#dba2a2" />
      <path d="M8 30L21 37L32 48L15 41Z" fill={cat.dark} opacity=".3" />
      {type === "calico" && (
        <>
          <path d="M15 21L24 17L29 27L21 32L13 29Z" fill={cat.mark} />
          <path d="M41 19L51 24L49 37L41 34Z" fill="#44454b" />
          <path d="M37 48L45 45L49 55L39 59Z" fill={cat.mark} />
        </>
      )}
      {type === "tuxedo" && (
        <path
          d="M27 34H38L39 44L32 48L26 43Z M26 48H37L39 59H25Z"
          fill={cat.mark}
        />
      )}
      {(type === "orange" || type === "tabby") && (
        <path
          d="M26 16H29V23H27Z M33 15H36L35 23H33Z M40 16H42L40 23H38Z M42 46L49 47V50L41 49Z M41 52L50 53V56L41 55Z"
          fill={cat.mark}
        />
      )}
      <ellipse cx="22" cy="31" rx="2" ry="3" fill={cat.eyes} />
      <ellipse cx="41" cy="31" rx="2" ry="3" fill={cat.eyes} />
      <path d="M27 37L32 34L38 37L35 41H29Z" fill="#f6ead8" />
      <path d="M29 35H35L32 38Z" fill="#b88084" />
    </svg>
  );
}
export function CatSelector({
  value,
  onChange,
  disabled = false,
}: {
  value?: CatType;
  onChange?: (cat: CatType) => void;
  disabled?: boolean;
}) {
  const appearance = useAppearance();
  const catType = value ?? appearance.catType;
  const select = onChange ?? appearance.select;
  return (
    <section className="cat-selector" aria-label="고양이 선택">
      <h3>어떤 고양이로 산책할까요?</h3>
      <p>
        {onChange
          ? "마음에 드는 모습을 고르고 저장해 주세요."
          : "비회원 외형은 이 브라우저에 기억해요."}
      </p>
      <div className="cat-options">
        {CAT_TYPES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            disabled={disabled}
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
