"use client"

import { apiClient } from "@/lib/api/http"
import type { ApiResponse, Tag } from "@/types/api"

type TagListResponse =
  | Tag[]
  | {
      tags?: Tag[]
      data?: Tag[]
    }

export async function listTags(workspaceId: number) {
  const response = await apiClient.get<ApiResponse<TagListResponse>>(`/tags/${workspaceId}`)
  const payload = response.data.data

  if (Array.isArray(payload)) {
    return payload
  }

  return payload.tags ?? payload.data ?? []
}

export async function createTag(
  workspaceId: number,
  input: {
    name: string
    color: string
  }
) {
  const response = await apiClient.post<ApiResponse<Tag>>(`/tags/${workspaceId}`, input)
  return response.data.data
}

export async function assignTagToTask(workspaceId: number, taskId: number, tagId: number) {
  const response = await apiClient.post<ApiResponse<{ success?: boolean }>>(
    `/tags/${workspaceId}/assign/${taskId}/${tagId}`
  )

  return response.data.data
}

export async function removeTagFromTask(workspaceId: number, taskId: number, tagId: number) {
  const response = await apiClient.delete<ApiResponse<{ success?: boolean }>>(
    `/tags/${workspaceId}/remove/${taskId}/${tagId}`
  )

  return response.data.data
}
