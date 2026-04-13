"use client"

import { apiClient } from "@/lib/api/http"
import type { ApiResponse, AttachmentItem } from "@/types/api"

type AttachmentListResponse =
  | AttachmentItem[]
  | {
      attachments?: AttachmentItem[]
      data?: AttachmentItem[]
    }

export async function listTaskAttachments(workspaceId: number, taskId: number) {
  const response = await apiClient.get<ApiResponse<AttachmentListResponse>>(
    `/attachments/${workspaceId}/${taskId}`
  )
  const payload = response.data.data

  if (Array.isArray(payload)) {
    return payload
  }

  return payload.attachments ?? payload.data ?? []
}
