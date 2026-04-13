"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createComment, listTaskComments } from "@/features/comments/api"
import { useAuthStore } from "@/stores/auth-store"

export function useTaskCommentsQuery(workspaceId: number | null, taskId: number | null) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  return useQuery({
    queryKey:
      workspaceId && taskId ? ["comments", workspaceId, taskId] : ["comments", "empty"],
    queryFn: () => listTaskComments(workspaceId as number, taskId as number),
    enabled: isHydrated && Boolean(accessToken) && workspaceId !== null && taskId !== null,
  })
}

export function useCreateCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      taskId,
      content,
      parentCommentId,
    }: {
      workspaceId: number
      taskId: number
      content: string
      parentCommentId?: number | null
    }) => createComment(workspaceId, { taskId, content, parentCommentId }),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["comments", variables.workspaceId, variables.taskId],
      })
    },
  })
}
