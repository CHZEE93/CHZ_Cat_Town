import type { Interactable } from "../interaction/Interactable";
export type { Interactable } from "../interaction/Interactable";
export type { InteractionType as Place } from "../interaction/Interactable";
// World units, seconds. Y is height, X/Z is the walkable plane.
export const PLAYER_SPEED = 4.8;
export const PLAYER_RADIUS = 0.34;
export const WORLD = { width: 80, depth: 70, boundary: 0.25 };
export const SPAWN = { x: 0, y: 0.64, z: 9 };
export const CAMERA = { offset: [13, 18, 21] as const, fov: 43, follow: 4.5 };
export const BUILDINGS = {
  home: { x: 0, z: -10, width: 4.7, depth: 3.5 },
  shop: { x: 10, z: 0, width: 5, depth: 3.8 },
  neighbor: { x: -10, z: -0.8, width: 4.6, depth: 3.5 },
};
export const BOARD_POSITION = { x: 0, z: -4.6 };
export const NEIGHBORHOOD = [
  { x: -25, z: -22, width: 4.6, depth: 3.5 },
  { x: 25, z: -23, width: 4.6, depth: 3.5 },
  { x: -25, z: 22, width: 4.6, depth: 3.5 },
  { x: 25, z: 22, width: 4.6, depth: 3.5 },
] as const;
export const GATHERING_SPOTS = [
  { x: -24, z: 5, radius: 7, title: "CAT PARK" },
  { x: 24, z: -12, radius: 6.5, title: "SUNNY GARDEN" },
] as const;
export const PLACES: Interactable[] = [
  {
    id: "board",
    type: "board",
    position: { x: 0, z: -3.65 },
    interactionRadius: 1.8,
    label: "게시판 보기",
  },
  {
    id: "shop",
    type: "shop",
    position: { x: 10, z: 2.45 },
    interactionRadius: 2,
    label: "상점 둘러보기",
  },
  {
    id: "home",
    type: "profile",
    position: { x: 0, z: -7.6 },
    interactionRadius: 1.8,
    label: "내 프로필 보기",
  },
];
export const TREES = [
  [-14, -11],
  [-10, -12],
  [-6, -12],
  [6, -12],
  [11, -11],
  [14, -8],
  [-14, -6],
  [-7, -7],
  [7, -7],
  [-14, 1],
  [14, 5],
  [-12, 8],
  [-8, 10],
  [8, 9],
  [12, 11],
  [-13, 12],
  [3, 12],
  [-4, 12],
  [-36, -30],
  [-28, -30],
  [-18, -30],
  [-7, -30],
  [7, -30],
  [18, -30],
  [28, -30],
  [36, -30],
  [-36, -20],
  [-36, -9],
  [-36, 3],
  [-36, 15],
  [-36, 29],
  [36, -20],
  [36, -9],
  [36, 3],
  [36, 15],
  [36, 29],
  [-27, 31],
  [-17, 31],
  [-7, 31],
  [7, 31],
  [17, 31],
  [27, 31],
  [-20, -11],
  [-19, 15],
  [19, 12],
  [14, 22],
  [-14, 22],
] as const;
