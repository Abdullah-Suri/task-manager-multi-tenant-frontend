"use client"

import { apiClient } from "@/lib/api/http"
import type { ApiResponse, NotificationItem } from "@/types/api"

type NotificationsResponse = {
  notifications: NotificationItem[]
  unreadCount: number
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export async function listNotifications() {
  const response = await apiClient.get<ApiResponse<NotificationsResponse>>("/notifications")
  return response.data.data
}
