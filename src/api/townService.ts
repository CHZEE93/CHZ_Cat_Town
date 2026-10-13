import { request } from "./client";
import type {
  Character,
  CoinTransaction,
  Item,
  Post,
  PostInput,
  PostPage,
  Product,
  Session,
  User,
} from "../types/api";
import type { CatType } from "../game/config/cats";
const json = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});
export const townService = {
  session: () => request<Session>("/auth/session"),
  login: (email: string, password: string) =>
    request<Session>("/auth/login", json("POST", { email, password })),
  signup: (
    email: string,
    password: string,
    nickname: string,
    catType: CatType,
  ) =>
    request<Session>(
      "/auth/signup",
      json("POST", { email, password, nickname, catType }),
    ),
  logout: () => request<void>("/auth/logout", json("POST")),
  posts: (signal?: AbortSignal, before?: number) =>
    request<PostPage>(`/posts${before ? `?before=${before}` : ""}`, { signal }),
  createPost: (data: PostInput) => request<Post>("/posts", json("POST", data)),
  updatePost: (id: number, data: PostInput) =>
    request<Post>(`/posts/${id}`, json("PATCH", data)),
  deletePost: (id: number) => request<void>(`/posts/${id}`, json("DELETE")),
  products: ({ signal }: { signal?: AbortSignal } = {}) =>
    request<Product[]>("/shop/products", { signal }),
  wallet: ({ signal }: { signal?: AbortSignal } = {}) =>
    request<{ balance: number }>("/wallet/me", { signal }),
  transactions: ({ signal }: { signal?: AbortSignal } = {}) =>
    request<CoinTransaction[]>("/wallet/me/transactions", { signal }),
  inventory: ({ signal }: { signal?: AbortSignal } = {}) =>
    request<Item[]>("/inventory/me", { signal }),
  purchase: (productId: number, key: string) =>
    request<{ purchaseId: string; balance: number; replayed: boolean }>(
      "/shop/purchases",
      { ...json("POST", { productId }), headers: { "Idempotency-Key": key } },
    ),
  updateProfile: (nickname: string, bio: string) =>
    request<User>("/users/me", json("PATCH", { nickname, bio })),
  character: () => request<Character>("/characters/me"),
  updateCharacter: (data: Character) =>
    request<Character>("/characters/me", json("PATCH", data)),
};
