"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuthStore } from "@/stores/auth-store"

export function RootGateway() {
  const router = useRouter()
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    router.replace(accessToken ? "/app" : "/login")
  }, [accessToken, isHydrated, router])

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">TaskHub</p>
        <h1 className="mt-3 text-2xl font-semibold">Preparing your workspace</h1>
      </div>
    </main>
  )
}
