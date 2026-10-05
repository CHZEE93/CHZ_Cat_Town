import { create } from "zustand";
import { isCatType, type CatType } from "../game/config/cats";
function savedCat(): CatType {
  try {
    const saved = localStorage.getItem("chz-cat-type");
    return isCatType(saved) ? saved : "orange";
  } catch {
    return "orange";
  }
}
export const useAppearance = create<{
  catType: CatType;
  select: (catType: CatType) => void;
}>((set) => ({
  catType: savedCat(),
  select: (catType) => {
    set({ catType });
    try {
      localStorage.setItem("chz-cat-type", catType);
    } catch {
      /* Session selection still works when storage is unavailable. */
    }
  },
}));
