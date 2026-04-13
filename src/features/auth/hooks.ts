"use client"

import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  confirmTwoFactor,
  disableTwoFactor,
  getProfile,
  googleLogin,
  login,
  logout,
  register,
  setupTwoFactor,
  updateProfile,
  verifyLoginTwoFactor,
} from "@/features/auth/api"
import { queryKeys } from "@/lib/query/keys"
import { useAuthStore } from "@/stores/auth-store"
import { useWorkspaceStore } from "@/stores/workspace-store"
import type { AuthPayload, TwoFactorChallenge } from "@/types/api"

function isTwoFactorChallenge(
  payload: AuthPayload | TwoFactorChallenge
): payload is TwoFactorChallenge {
  return "is2FARequired" in payload && payload.is2FARequired
}

export function useProfileQuery(enabled: boolean) {
  const updateUser = useAuthStore((state) => state.updateUser)

  const query = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: getProfile,
    enabled,
  })

  useEffect(() => {
    if (query.data) {
      updateUser(query.data)
    }
  }, [query.data, updateUser])

  return query
}

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession)
  const setTwoFactorChallenge = useAuthStore((state) => state.setTwoFactorChallenge)

  return useMutation({
    mutationFn: login,
    onSuccess: (payload) => {
      if (isTwoFactorChallenge(payload)) {
        setTwoFactorChallenge(payload.userId)
        return
      }

      setSession(payload)
    },
  })
}

export function useRegisterMutation() {
  const setSession = useAuthStore((state) => state.setSession)
  const setTwoFactorChallenge = useAuthStore((state) => state.setTwoFactorChallenge)

  return useMutation({
    mutationFn: register,
    onSuccess: (payload) => {
      if (isTwoFactorChallenge(payload)) {
        setTwoFactorChallenge(payload.userId)
        return
      }

      setSession(payload)
    },
  })
}

export function useVerifyTwoFactorMutation() {
  const setSession = useAuthStore((state) => state.setSession)

  return useMutation({
    mutationFn: verifyLoginTwoFactor,
    onSuccess: (payload) => {
      setSession(payload)
    },
  })
}

export function useGoogleLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession)
  const setTwoFactorChallenge = useAuthStore((state) => state.setTwoFactorChallenge)

  return useMutation({
    mutationFn: googleLogin,
    onSuccess: (payload) => {
      if (isTwoFactorChallenge(payload)) {
        setTwoFactorChallenge(payload.userId)
        return
      }

      setSession(payload)
    },
  })
}

export function useUpdateProfileMutation() {
  const updateUser = useAuthStore((state) => state.updateUser)

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => {
      updateUser(profile)
    },
  })
}

export function useSetupTwoFactorMutation() {
  return useMutation({
    mutationFn: setupTwoFactor,
  })
}

export function useConfirmTwoFactorMutation() {
  const updateUser = useAuthStore((state) => state.updateUser)

  return useMutation({
    mutationFn: confirmTwoFactor,
    onSuccess: () => {
      updateUser({ isTwoFactorEnabled: true })
    },
  })
}

export function useDisableTwoFactorMutation() {
  const updateUser = useAuthStore((state) => state.updateUser)

  return useMutation({
    mutationFn: disableTwoFactor,
    onSuccess: () => {
      updateUser({ isTwoFactorEnabled: false })
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const clearSession = useAuthStore((state) => state.clearSession)
  const resetWorkspace = useWorkspaceStore((state) => state.reset)

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) {
        return null
      }

      return logout({ refreshToken })
    },
    onSettled: async () => {
      clearSession()
      resetWorkspace()
      await queryClient.clear()
    },
  })
}
