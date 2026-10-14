import type { CatType } from "../game/config/cats";
export type Slot = "head" | "neck" | "back";
export type Equipment = Record<Slot, string | null>;
export type Character = {
  catType: CatType;
  scale: number;
  equipped: Equipment;
  version: number;
};
export type User = {
  id: number;
  email: string;
  nickname: string;
  bio: string;
  createdAt: string;
};
export type Session = {
  user: User | null;
  csrfToken: string | null;
  character: Character | null;
};
export type Item = {
  id: string;
  name: string;
  description: string;
  slot: Slot;
  assetKey: string;
  icon: string;
};
export type Product = { id: number; price: number; item: Item };
export type PostInput = {
  title: string;
  body: string;
  category: "인사" | "일상" | "모임";
};
export type Post = PostInput & {
  id: number;
  authorId: number;
  author: string;
  createdAt: string;
  updatedAt: string;
};
export type PostPage = { items: Post[]; nextCursor: number | null };
export type CoinTransaction = {
  id: number;
  amount: number;
  reason: string;
  createdAt: string;
};
export type Quest = {
  code: string;
  title: string;
  npc: string;
  description: string;
  sourceId: string;
  targetId: string;
  targetName: string;
  amount: number;
  status: "available" | "active" | "completed";
  assignmentId: string | null;
  readyAt: string | null;
};
export type RewardDay = {
  dayKey: string;
  resetsAt: string;
  dailyLimit: number;
  earned: number;
  checkin: boolean;
  walkComplete: boolean;
  stamps: { id: string; name: string; amount: number; claimed: boolean }[];
  quests: Quest[];
};
export type RewardResult = {
  claimId: string;
  amount: number;
  balance: number;
  replayed: boolean;
  today: RewardDay;
};
