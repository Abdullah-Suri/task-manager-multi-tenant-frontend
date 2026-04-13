"use client"

import { apiClient } from "@/lib/api/http"
import type { ApiResponse, WorkspaceMember } from "@/types/api"

type MemberListResponse =
  | WorkspaceMember[]
  | {
      members?: WorkspaceMember[]
      data?: WorkspaceMember[]
    }

export async function listMembers(workspaceId: number) {
  const response = await apiClient.get<ApiResponse<MemberListResponse>>(`/members/${workspaceId}`)
  const payload = response.data.data

  if (Array.isArray(payload)) {
    return payload
  }

  return payload.members ?? payload.data ?? []
}

export async function updateMemberRole(
  workspaceId: number,
  userId: number,
  input: { roleId: number }
) {
  const response = await apiClient.patch<ApiResponse<WorkspaceMember>>(
    `/members/${workspaceId}/${userId}`,
    input
  )

  return response.data.data
}

export async function removeMember(workspaceId: number, userId: number) {
  const response = await apiClient.delete<ApiResponse<null>>(`/members/${workspaceId}/${userId}`)
  return response.data.data
}
