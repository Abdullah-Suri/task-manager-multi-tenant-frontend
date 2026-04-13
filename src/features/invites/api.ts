"use client"

import { apiClient } from "@/lib/api/http"
import type { ApiResponse } from "@/types/api"

export async function createInvite(
  workspaceId: number,
  input: {
    email: string
    roleId: number
  }
) {
  const response = await apiClient.post<ApiResponse<{ id?: number }>>(
    `/invites/${workspaceId}`,
    input
  )

  return response.data.data
}
