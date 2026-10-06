export type InteractionType = "board" | "shop" | "profile";
export interface Interactable {
  id: string;
  type: InteractionType;
  position: { x: number; z: number };
  interactionRadius: number;
  label: string;
}
