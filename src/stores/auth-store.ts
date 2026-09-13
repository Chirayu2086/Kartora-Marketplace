"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SessionUser {
  name: string;
  phone?: string;
  email?: string;
}

interface AuthState {
  user: SessionUser | null;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  login: (user: SessionUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loginOpen: false,
      openLogin: () => set({ loginOpen: true }),
      closeLogin: () => set({ loginOpen: false }),
      login: (user) => set({ user, loginOpen: false }),
      logout: () => set({ user: null }),
    }),
    { name: "kartora-session", partialize: (s) => ({ user: s.user }) as Partial<AuthState> }
  )
);
