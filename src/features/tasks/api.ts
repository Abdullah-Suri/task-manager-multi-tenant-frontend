"use client"

import { apiClient } from "@/lib/api/http"
import type { ApiResponse, Task } from "@/types/api"

type TaskListResponse = {
  tasks: Task[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function getTaskDetail(workspaceId: number, taskId: number) {
  const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${workspaceId}/detail/${taskId}`)
  return response.data.data
}

export async function listTasks(workspaceId: number, projectId: number) {
  const response = await apiClient.get<ApiResponse<TaskListResponse>>(
    `/tasks/${workspaceId}/${projectId}`
  )

  return response.data.data
}

type TaskMutationInput = {
  title: string
  description?: string
  status: Task["status"]
  priority: Task["priority"]
  dueDate?: string
  assignedToId?: number | null
  position?: number
  files?: File[]
}

export async function createTask(
  workspaceId: number,
  projectId: number,
  input: TaskMutationInput
) {
  const formData = new FormData()
  formData.set("title", input.title)
  formData.set("status", input.status)
  formData.set("priority", input.priority)

  if (input.description) {
    formData.set("description", input.description)
  }

  if (input.dueDate) {
    formData.set("dueDate", input.dueDate)
  }

  if (typeof input.assignedToId === "number") {
    formData.set("assignedToId", String(input.assignedToId))
  }

  if (typeof input.position === "number" && Number.isFinite(input.position)) {
    formData.set("position", String(input.position))
  }

  if (input.files?.length) {
    input.files.forEach((file) => {
      formData.append("files", file)
    })
  }

  const response = await apiClient.post<ApiResponse<Task>>(
    `/tasks/${workspaceId}/${projectId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  )
  return response.data.data
}

export async function updateTask(
  workspaceId: number,
  taskId: number,
  input: Partial<TaskMutationInput> & { projectId?: number }
) {
  const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${workspaceId}/${taskId}`, input)
  return response.data.data
}

export async function reorderTask(workspaceId: number, taskId: number, position: number) {
  const response = await apiClient.patch<ApiResponse<Task>>(
    `/tasks/${workspaceId}/reorder/${taskId}`,
    { position }
  )

  return response.data.data
}
