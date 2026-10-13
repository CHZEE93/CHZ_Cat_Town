import { create } from "zustand";
import { isCatType, type CatType } from "../game/config/cats";
import type { Character, Equipment } from "../types/api";
export const emptyEquipment = (): Equipment => ({
  head: null,
  neck: null,
  back: null,
});
function guestCharacter(): Character {
  let catType: CatType = "orange";
  try {
    const saved = localStorage.getItem("chz-cat-type");
    if (isCatType(saved)) catType = saved;
  } catch {
    /* Guest mode works without storage. */
  }
  return { catType, equipped: emptyEquipment(), version: 0 };
}
export const useAppearance = create<
  Character & {
    saved: Character;
    apply: (character: Character) => void;
    preview: (character: Character) => void;
    resetPreview: () => void;
    resetGuest: () => void;
    select: (catType: CatType) => void;
  }
>((set, get) => ({
  ...guestCharacter(),
  saved: guestCharacter(),
  apply: (character) => set({ ...character, saved: character }),
  preview: (character) => set(character),
  resetPreview: () => set(get().saved),
  resetGuest: () => {
    const character = guestCharacter();
    set({ ...character, saved: character });
  },
  select: (catType) => {
    const character = { catType, equipped: emptyEquipment(), version: 0 };
    set({ ...character, saved: character });
    try {
      localStorage.setItem("chz-cat-type", catType);
    } catch {
      /* Optional guest preference. */
    }
  },
}));
