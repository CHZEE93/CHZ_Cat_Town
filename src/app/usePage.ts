import { useSyncExternalStore } from "react";
export type Page = "home" | "game";
function currentPage(): Page {
  return location.hash === "#/game" ? "game" : "home";
}
function subscribe(listener: () => void) {
  window.addEventListener("hashchange", listener);
  return () => window.removeEventListener("hashchange", listener);
}
export function usePage() {
  return useSyncExternalStore(subscribe, currentPage);
}
