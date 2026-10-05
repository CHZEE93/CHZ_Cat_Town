export type Place = "board" | "shop" | "profile";
export interface Interactable {
  id: string;
  type: Place;
  position: { x: number; y: number };
  interactionRadius: number;
  label: string;
}
export const PLAYER_SPEED = 175;
export const WORLD = { width: 1280, height: 960 };
export const SPAWN = { x: 640, y: 720 };
export const PLACES: Interactable[] = [
  {
    id: "board",
    type: "board",
    position: { x: 640, y: 410 },
    interactionRadius: 84,
    label: "게시판 보기",
  },
  {
    id: "shop",
    type: "shop",
    position: { x: 960, y: 595 },
    interactionRadius: 88,
    label: "상점 둘러보기",
  },
  {
    id: "home",
    type: "profile",
    position: { x: 640, y: 255 },
    interactionRadius: 80,
    label: "내 프로필 보기",
  },
];
