import { create } from "zustand";
import { townService } from "../api/townService";
import { setCsrfToken } from "../api/client";
import { queryClient } from "../api/queryClient";
import { useAppearance } from "./appearance";
import type { Session, User } from "../types/api";
let generation = 0;
export const useAuth = create<{
  user: User | null;
  loading: boolean;
  error: string | null;
  accept: (session: Session) => void;
  refresh: () => Promise<void>;
  expire: () => void;
  updateUser: (user: User) => void;
}>((set) => ({
  user: null,
  loading: true,
  error: null,
  accept: (session) => {
    generation++;
    void queryClient.cancelQueries();
    queryClient.clear();
    setCsrfToken(session.csrfToken);
    if (session.character) useAppearance.getState().apply(session.character);
    else useAppearance.getState().resetGuest();
    set({ user: session.user, loading: false, error: null });
  },
  refresh: async () => {
    const current = ++generation;
    set({ loading: true, error: null });
    try {
      const session = await townService.session();
      if (current === generation) useAuth.getState().accept(session);
    } catch {
      if (current === generation)
        set({ loading: false, error: "계정 서버에 연결하지 못했어요." });
    }
  },
  expire: () => {
    useAuth.getState().accept({ user: null, csrfToken: null, character: null });
    set({ error: "로그인이 만료되었어요. 다시 로그인해 주세요." });
  },
  updateUser: (user) => set({ user }),
}));
