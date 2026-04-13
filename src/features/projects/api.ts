"use client"

import { apiClient } from "@/lib/api/http"
import type { ApiResponse, Project } from "@/types/api"

type ProjectListResponse = {
  projects: Project[]
}

export async function listProjects(workspaceId: number) {
  const response = await apiClient.get<ApiResponse<ProjectListResponse | Project[]>>(
    `/projects/${workspaceId}`
  )

  const payload = response.data.data

  if (Array.isArray(payload)) {
    return payload
  }

  return payload.projects
}

export async function createProject(workspaceId: number, input: { name: string }) {
  const response = await apiClient.post<ApiResponse<Project>>(`/projects/${workspaceId}`, input)
  return response.data.data
}

export async function updateProject(
  workspaceId: number,
  projectId: number,
  input: { name: string }
) {
  const response = await apiClient.patch<ApiResponse<Project>>(
    `/projects/${workspaceId}/${projectId}`,
    input
  )
  return response.data.data
}
