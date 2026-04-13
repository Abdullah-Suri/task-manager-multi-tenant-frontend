"use client"

import { useAuthStore } from "@/stores/auth-store"

export function getAccessToken() {
  return useAuthStore.getState().accessToken
}

export function getRefreshToken() {
  return useAuthStore.getState().refreshToken
}

export function clearSession() {
  useAuthStore.getState().clearSession()
}
