"use client"

import { apiClient } from "@/lib/api/http"
import type { ApiResponse, Workspace } from "@/types/api"

type WorkspaceListResponse = {
  workspaces: Workspace[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function listWorkspaces(search?: string) {
  const response = await apiClient.get<ApiResponse<WorkspaceListResponse | Workspace[]>>(
    "/workspaces",
    {
      params: search ? { search } : undefined,
    }
  )

  const payload = response.data.data

  if (Array.isArray(payload)) {
    return payload
  }

  return payload.workspaces
}

export async function getWorkspaceDetail(workspaceId: number) {
  const response = await apiClient.get<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`)
  return response.data.data
}

export async function createWorkspace(input: { name: string }) {
  const response = await apiClient.post<ApiResponse<Workspace>>("/workspaces", input)
  return response.data.data
}

export async function updateWorkspace(workspaceId: number, input: { name: string }) {
  const response = await apiClient.patch<ApiResponse<Workspace>>(
    `/workspaces/${workspaceId}`,
    input
  )
  return response.data.data
}
