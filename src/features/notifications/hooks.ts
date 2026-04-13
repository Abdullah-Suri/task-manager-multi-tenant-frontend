"use client"

import { useQuery } from "@tanstack/react-query"

import { listNotifications } from "@/features/notifications/api"
import { queryKeys } from "@/lib/query/keys"
import { useAuthStore } from "@/stores/auth-store"

export function useNotificationsQuery() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  return useQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: listNotifications,
    enabled: isHydrated && Boolean(accessToken),
  })
}
