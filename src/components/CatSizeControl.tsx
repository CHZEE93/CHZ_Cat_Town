import { useId } from "react";
import { CAT_SIZE } from "../game/config/appearance";
export function CatSizeControl({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <section className="cat-size-control" aria-label="고양이 크기 설정">
      <div className="size-heading">
        <label htmlFor={id}>고양이 크기</label>
        <span className="size-value" aria-hidden="true">
          {Math.round(value * 100)}%
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={CAT_SIZE.min}
        max={CAT_SIZE.max}
        step={CAT_SIZE.step}
        value={value}
        aria-valuetext={`${Math.round(value * 100)}%`}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="size-labels">
        <span>아담하게 · 75%</span>
        <button
          type="button"
          disabled={disabled || value === CAT_SIZE.default}
          onClick={() => onChange(CAT_SIZE.default)}
        >
          기본 크기로
        </button>
        <span>크게 · 150%</span>
      </div>
    </section>
  );
}
