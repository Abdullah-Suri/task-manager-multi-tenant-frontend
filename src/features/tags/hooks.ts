"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { assignTagToTask, createTag, listTags, removeTagFromTask } from "@/features/tags/api"
import { queryKeys } from "@/lib/query/keys"
import { useAuthStore } from "@/stores/auth-store"

export function useTagsQuery(workspaceId: number | null) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  return useQuery({
    queryKey: workspaceId ? ["tags", workspaceId] : ["tags", "empty"],
    queryFn: () => listTags(workspaceId as number),
    enabled: isHydrated && Boolean(accessToken) && workspaceId !== null,
  })
}

export function useAssignTagMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      taskId,
      tagId,
      projectId,
    }: {
      workspaceId: number
      taskId: number
      tagId: number
      projectId: number
    }) => assignTagToTask(workspaceId, taskId, tagId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(variables.workspaceId, variables.projectId),
      })
    },
  })
}

export function useCreateTagMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      name,
      color,
    }: {
      workspaceId: number
      name: string
      color: string
    }) => createTag(workspaceId, { name, color }),
    onSuccess: async (_tag, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["tags", variables.workspaceId],
      })
    },
  })
}

export function useRemoveTagMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      taskId,
      tagId,
      projectId,
    }: {
      workspaceId: number
      taskId: number
      tagId: number
      projectId: number
    }) => removeTagFromTask(workspaceId, taskId, tagId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(variables.workspaceId, variables.projectId),
      })
    },
  })
}
