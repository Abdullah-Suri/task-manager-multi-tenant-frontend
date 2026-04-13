"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { createTask, getTaskDetail, listTasks, reorderTask, updateTask } from "@/features/tasks/api"
import { queryKeys } from "@/lib/query/keys"
import { useAuthStore } from "@/stores/auth-store"

export function useTasksQuery(workspaceId: number | null, projectId: number | null) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  return useQuery({
    queryKey:
      workspaceId && projectId
        ? queryKeys.tasks.list(workspaceId, projectId)
        : ["tasks", "empty"],
    queryFn: () => listTasks(workspaceId as number, projectId as number),
    enabled:
      isHydrated &&
      Boolean(accessToken) &&
      workspaceId !== null &&
      projectId !== null,
  })
}

export function useTaskDetailQuery(workspaceId: number | null, taskId: number | null) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  return useQuery({
    queryKey: workspaceId && taskId ? ["task", workspaceId, taskId] : ["task", "empty"],
    queryFn: () => getTaskDetail(workspaceId as number, taskId as number),
    enabled: isHydrated && Boolean(accessToken) && workspaceId !== null && taskId !== null,
  })
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      projectId,
      ...input
    }: {
      workspaceId: number
      projectId: number
      title: string
      description?: string
      status: "TODO" | "IN_PROGRESS" | "DONE"
      priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      dueDate?: string
      assignedToId?: number | null
      position?: number
      files?: File[]
    }) => createTask(workspaceId, projectId, input),
    onSuccess: async (_task, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(variables.workspaceId, variables.projectId),
      })
    },
  })
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      taskId,
      ...input
    }: {
      workspaceId: number
      taskId: number
      title?: string
      description?: string
      status?: "TODO" | "IN_PROGRESS" | "DONE"
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
      dueDate?: string
      assignedToId?: number | null
      projectId?: number
    }) => updateTask(workspaceId, taskId, input),
    onSuccess: async (_task, variables) => {
      if (typeof variables.projectId === "number") {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.tasks.list(variables.workspaceId, variables.projectId),
        })
      }
    },
  })
}

export function useReorderTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      taskId,
      position,
    }: {
      workspaceId: number
      taskId: number
      position: number
      projectId: number
    }) => reorderTask(workspaceId, taskId, position),
    onSuccess: async (_task, variables) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.list(variables.workspaceId, variables.projectId),
      })
    },
  })
}
