"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createProject, listProjects, updateProject } from "@/features/projects/api"
import { queryKeys } from "@/lib/query/keys"
import { useAuthStore } from "@/stores/auth-store"
import { useWorkspaceStore } from "@/stores/workspace-store"

export function useProjectsQuery(workspaceId: number | null) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  return useQuery({
    queryKey: workspaceId ? queryKeys.projects.list(workspaceId) : ["projects", "empty"],
    queryFn: () => listProjects(workspaceId as number),
    enabled: isHydrated && Boolean(accessToken) && workspaceId !== null,
  })
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()
  const setActiveProjectId = useWorkspaceStore((state) => state.setActiveProjectId)

  return useMutation({
    mutationFn: ({ workspaceId, name }: { workspaceId: number; name: string }) =>
      createProject(workspaceId, { name }),
    onSuccess: async (project) => {
      setActiveProjectId(project.id)
      await queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(project.workspaceId),
      })
    },
  })
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      name,
    }: {
      workspaceId: number
      projectId: number
      name: string
    }) => updateProject(workspaceId, projectId, { name }),
    onSuccess: async (project) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.projects.list(project.workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.list(project.workspaceId, project.id),
        }),
      ])
    },
  })
}
