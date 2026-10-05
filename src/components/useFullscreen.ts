import { useEffect, useRef, useState } from "react";
export function useFullscreen() {
  const root = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const onChange = () =>
      setExpanded(document.fullscreenElement === root.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement)
        setExpanded(false);
    };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [expanded]);
  const toggle = async () => {
    if (expanded) {
      if (document.fullscreenElement === root.current)
        await document.exitFullscreen();
      else setExpanded(false);
    } else {
      try {
        if (!root.current?.requestFullscreen) throw new Error("unavailable");
        await root.current.requestFullscreen();
      } catch {
        setExpanded(true);
      }
    }
  };
  return { root, expanded, toggle };
}
