import { create } from "zustand";
import type { Interactable, Place } from "../game/config/constants";
interface UIState {
  modal: Place | "guide" | "auth" | null;
  nearby: Interactable | null;
  ready: boolean;
  rewardPlace: string | null;
  openReward: (place: string) => void;
  open: (modal: UIState["modal"]) => void;
  setNearby: (nearby: Interactable | null) => void;
  setReady: () => void;
}
export const useUI = create<UIState>((set) => ({
  modal: null,
  nearby: null,
  ready: false,
  rewardPlace: null,
  openReward: (rewardPlace) => set({ modal: "rewards", rewardPlace }),
  open: (modal) => set({ modal }),
  setNearby: (nearby) => set({ nearby }),
  setReady: () => set({ ready: true }),
}));
