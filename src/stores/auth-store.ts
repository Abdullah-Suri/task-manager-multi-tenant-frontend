"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import type { AuthPayload, AuthUser } from "@/types/api"

type AuthState = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  twoFactorUserId: number | null
  isHydrated: boolean
  setSession: (payload: AuthPayload) => void
  updateUser: (user: Partial<AuthUser>) => void
  setTwoFactorChallenge: (userId: number) => void
  clearSession: () => void
  markHydrated: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      twoFactorUserId: null,
      isHydrated: false,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user, twoFactorUserId: null }),
      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : (user as AuthUser),
        })),
      setTwoFactorChallenge: (userId) => set({ twoFactorUserId: userId }),
      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          twoFactorUserId: null,
        }),
      markHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "taskhub-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        twoFactorUserId: state.twoFactorUserId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated()
      },
    }
  )
)
