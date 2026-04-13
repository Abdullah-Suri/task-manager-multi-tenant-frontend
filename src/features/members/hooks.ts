"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { listMembers, removeMember, updateMemberRole } from "@/features/members/api"
import { useAuthStore } from "@/stores/auth-store"

export function useMembersQuery(workspaceId: number | null) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  return useQuery({
    queryKey: workspaceId ? ["members", workspaceId] : ["members", "empty"],
    queryFn: () => listMembers(workspaceId as number),
    enabled: isHydrated && Boolean(accessToken) && workspaceId !== null,
  })
}

export function useUpdateMemberRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      userId,
      roleId,
    }: {
      workspaceId: number
      userId: number
      roleId: number
    }) => updateMemberRole(workspaceId, userId, { roleId }),
    onSuccess: async (_member, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["members", variables.workspaceId],
      })
    },
  })
}

export function useRemoveMemberMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      userId,
    }: {
      workspaceId: number
      userId: number
    }) => removeMember(workspaceId, userId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["members", variables.workspaceId],
      })
    },
  })
}
