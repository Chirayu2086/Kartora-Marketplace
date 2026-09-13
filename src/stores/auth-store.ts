"use client";

import { create } from "zustand";
import type { SessionUser } from "@/lib/auth/session";

interface AuthState {
  user: SessionUser | null;
  loginOpen: boolean;
  hydrated: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (user: SessionUser) => void;
  hydrate: (user: SessionUser | null) => void;
  logout: () => void;
}

/** UI mirror of the server session cookie. The cookie remains the source of truth; all protected server operations re-verify it. */
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loginOpen: false,
  hydrated: false,
  openLogin: () => set({ loginOpen: true }),
  closeLogin: () => set({ loginOpen: false }),
  login: (user) => set({ user, loginOpen: false, hydrated: true }),
  hydrate: (user) => set({ user, hydrated: true }),
  logout: () => set({ user: null }),
}));
