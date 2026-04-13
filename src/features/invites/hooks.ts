"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { createInvite } from "@/features/invites/api"

export function useCreateInviteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      email,
      roleId,
    }: {
      workspaceId: number
      email: string
      roleId: number
    }) => createInvite(workspaceId, { email, roleId }),
    onSuccess: async (_invite, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["members", variables.workspaceId],
      })
    },
  })
}
