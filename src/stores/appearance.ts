import { create } from "zustand";
import { isCatType, type CatType } from "../game/config/cats";
import type { Character, Equipment } from "../types/api";
import { CAT_SIZE } from "../game/config/appearance";
export const emptyEquipment = (): Equipment => ({
  head: null,
  neck: null,
  back: null,
});
function guestCharacter(): Character {
  let catType: CatType = "orange";
  let scale = CAT_SIZE.default;
  try {
    const saved = localStorage.getItem("chz-cat-type");
    if (isCatType(saved)) catType = saved;
    const size = Number(localStorage.getItem("chz-cat-size") ?? 1);
    if (Number.isFinite(size) && size >= CAT_SIZE.min && size <= CAT_SIZE.max)
      scale = size;
  } catch {
    /* Guest mode works without storage. */
  }
  return { catType, scale, equipped: emptyEquipment(), version: 0 };
}
export const useAppearance = create<
  Character & {
    saved: Character;
    apply: (character: Character) => void;
    preview: (character: Character) => void;
    resetPreview: () => void;
    resetGuest: () => void;
    select: (catType: CatType) => void;
    selectSize: (scale: number) => void;
  }
>((set, get) => ({
  ...guestCharacter(),
  saved: guestCharacter(),
  apply: (character) => {
    const saved = { ...character, scale: character.scale ?? CAT_SIZE.default };
    set({ ...saved, saved });
  },
  preview: (character) => set(character),
  resetPreview: () => set(get().saved),
  resetGuest: () => {
    const character = guestCharacter();
    set({ ...character, saved: character });
  },
  select: (catType) => {
    const character = {
      catType,
      scale: get().scale,
      equipped: emptyEquipment(),
      version: 0,
    };
    set({ ...character, saved: character });
    try {
      localStorage.setItem("chz-cat-type", catType);
    } catch {
      /* Optional guest preference. */
    }
  },
  selectSize: (scale) => {
    if (!Number.isFinite(scale) || scale < CAT_SIZE.min || scale > CAT_SIZE.max)
      return;
    const character = { ...get().saved, scale };
    set({ ...character, saved: character });
    try {
      localStorage.setItem("chz-cat-size", String(scale));
    } catch {
      /* Optional guest preference. */
    }
  },
}));
