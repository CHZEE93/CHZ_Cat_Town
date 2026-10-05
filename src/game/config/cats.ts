export const CAT_TYPES = [
  {
    id: "orange",
    name: "치즈고양이",
    english: "Orange Cat",
    base: "#eab36c",
    dark: "#c37632",
    mark: "#b77339",
    eyes: "#463c37",
  },
  {
    id: "calico",
    name: "삼색고양이",
    english: "Calico Cat",
    base: "#f3ead9",
    dark: "#c9bdab",
    mark: "#d48b4b",
    eyes: "#463c37",
  },
  {
    id: "tuxedo",
    name: "턱시도고양이",
    english: "Tuxedo Cat",
    base: "#393d44",
    dark: "#282c32",
    mark: "#faf4e7",
    eyes: "#d7dd95",
  },
  {
    id: "tabby",
    name: "고등어고양이",
    english: "Mackerel Tabby",
    base: "#a0a39b",
    dark: "#737b76",
    mark: "#4f5957",
    eyes: "#394640",
  },
  {
    id: "black",
    name: "검은고양이",
    english: "Black Cat",
    base: "#44434d",
    dark: "#2c2c35",
    mark: "#55525e",
    eyes: "#e3d788",
  },
  {
    id: "white",
    name: "흰고양이",
    english: "White Cat",
    base: "#faf6ec",
    dark: "#cfcac0",
    mark: "#e1ded4",
    eyes: "#628e9c",
  },
] as const;
export type CatType = (typeof CAT_TYPES)[number]["id"];
export function isCatType(value: unknown): value is CatType {
  return CAT_TYPES.some((cat) => cat.id === value);
}
