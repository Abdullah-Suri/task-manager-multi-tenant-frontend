"use client"

import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  createWorkspace,
  getWorkspaceDetail,
  listWorkspaces,
  updateWorkspace,
} from "@/features/workspaces/api"
import { queryKeys } from "@/lib/query/keys"
import { useAuthStore } from "@/stores/auth-store"
import { useWorkspaceStore } from "@/stores/workspace-store"

export function useWorkspacesQuery(search?: string) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  return useQuery({
    queryKey: queryKeys.workspaces.list(search),
    queryFn: () => listWorkspaces(search),
    enabled: isHydrated && Boolean(accessToken),
  })
}

export function useWorkspaceDetailQuery(workspaceId: number | null) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  return useQuery({
    queryKey: workspaceId
      ? queryKeys.workspaces.detail(workspaceId)
      : ["workspaces", "detail", "empty"],
    queryFn: () => getWorkspaceDetail(workspaceId as number),
    enabled: isHydrated && Boolean(accessToken) && workspaceId !== null,
  })
}

export function useResolvedWorkspaceSelection() {
  const { data: workspaces = [], isLoading } = useWorkspacesQuery()
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId)

  const activeWorkspace = useMemo(
    () =>
      activeWorkspaceId
        ? workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? null
        : null,
    [activeWorkspaceId, workspaces]
  )

  return {
    workspaces,
    activeWorkspace,
    isLoading,
    hasWorkspaces: workspaces.length > 0,
    selectWorkspace: setActiveWorkspaceId,
  }
}

export function useCreateWorkspaceMutation() {
  const queryClient = useQueryClient()
  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId)

  return useMutation({
    mutationFn: createWorkspace,
    onSuccess: async (workspace) => {
      setActiveWorkspaceId(workspace.id)
      await queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all })
    },
  })
}

export function useUpdateWorkspaceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, name }: { workspaceId: number; name: string }) =>
      updateWorkspace(workspaceId, { name }),
    onSuccess: async (workspace) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.detail(workspace.id) }),
      ])
    },
  })
}
