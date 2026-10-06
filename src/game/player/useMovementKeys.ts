import { useEffect } from "react";
import { useTownRuntime } from "../runtime/TownRuntime";
const MOVEMENT_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
]);
export function useMovementKeys() {
  const runtime = useTownRuntime();
  useEffect(() => {
    const clear = () => {
      runtime.keys.clear();
      runtime.velocity.set(0, 0, 0);
    };
    const down = (event: KeyboardEvent) => {
      if (!MOVEMENT_KEYS.has(event.code) || runtime.blocked) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.matches("input,textarea,select") || target.isContentEditable)
      )
        return;
      event.preventDefault();
      runtime.keys.add(event.code);
    };
    const up = (event: KeyboardEvent) => runtime.keys.delete(event.code);
    const visibility = () => {
      if (document.hidden) clear();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clear();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [runtime]);
}
