"use client"

import { useQuery } from "@tanstack/react-query"

import { listTaskAttachments } from "@/features/attachments/api"
import { useAuthStore } from "@/stores/auth-store"

export function useTaskAttachmentsQuery(workspaceId: number | null, taskId: number | null) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  return useQuery({
    queryKey:
      workspaceId && taskId
        ? ["attachments", workspaceId, taskId]
        : ["attachments", "empty"],
    queryFn: () => listTaskAttachments(workspaceId as number, taskId as number),
    enabled: isHydrated && Boolean(accessToken) && workspaceId !== null && taskId !== null,
  })
}
