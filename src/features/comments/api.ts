"use client"

import { apiClient } from "@/lib/api/http"
import type { ApiResponse, CommentItem } from "@/types/api"

type CommentListResponse = {
  comments: CommentItem[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function listTaskComments(workspaceId: number, taskId: number) {
  const response = await apiClient.get<ApiResponse<CommentListResponse>>(
    `/comments/${workspaceId}/task/${taskId}`
  )

  return response.data.data
}

export async function createComment(
  workspaceId: number,
  input: {
    taskId: number
    content: string
    parentCommentId?: number | null
  }
) {
  const response = await apiClient.post<ApiResponse<CommentItem>>(`/comments/${workspaceId}`, input)
  return response.data.data
}
