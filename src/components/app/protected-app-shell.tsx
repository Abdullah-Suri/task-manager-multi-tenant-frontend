"use client"

import { useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Bell } from "lucide-react"

import { useProjectsQuery } from "@/features/projects/hooks"
import { useResolvedWorkspaceSelection } from "@/features/workspaces/hooks"
import { useAuthStore } from "@/stores/auth-store"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { ThemeToggle } from "@/components/app/theme-toggle"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { WorkspaceSidebar } from "@/components/app/workspace-sidebar"

export function ProtectedAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hasAppliedFallback = useRef(false)
  const accessToken = useAuthStore((state) => state.accessToken)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const user = useAuthStore((state) => state.user)
  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId)
  const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId)
  const setActiveProjectId = useWorkspaceStore((state) => state.setActiveProjectId)
  const { activeWorkspace, workspaces, hasWorkspaces, isLoading } =
    useResolvedWorkspaceSelection()
  const { data: projects = [] } = useProjectsQuery(activeWorkspace?.id ?? null)

  const currentProject = useMemo(
    () => projects.find((project) => project.id === activeProjectId) ?? null,
    [activeProjectId, projects]
  )

  useEffect(() => {
    if (!isHydrated) {
      return
    }

    if (!accessToken) {
      router.replace("/login")
    }
  }, [accessToken, isHydrated, router])

  useEffect(() => {
    if (hasAppliedFallback.current || isLoading || !hasWorkspaces) {
      return
    }

    if (!activeWorkspace && workspaces[0]) {
      setActiveWorkspaceId(workspaces[0].id)
    }

    hasAppliedFallback.current = true
  }, [activeWorkspace, hasWorkspaces, isLoading, setActiveWorkspaceId, workspaces])

  useEffect(() => {
    if (!projects.length) {
      setActiveProjectId(null)
      return
    }

    if (!currentProject) {
      setActiveProjectId(projects[0].id)
    }
  }, [currentProject, projects, setActiveProjectId])

  if (!isHydrated || !accessToken) {
    return (
      <main className="flex min-h-svh items-center justify-center bg-background px-6">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">TaskHub</p>
          <h1 className="mt-3 text-2xl font-semibold">Checking your session</h1>
        </div>
      </main>
    )
  }

  return (
    <SidebarProvider>
      <WorkspaceSidebar />
      <SidebarInset className="min-h-svh bg-[linear-gradient(180deg,oklch(0.995_0.004_95),oklch(0.972_0.01_95))] p-2 dark:bg-[linear-gradient(180deg,oklch(0.16_0.01_260),oklch(0.19_0.01_260))] md:p-3">
        <div className="flex min-h-[calc(100svh-1rem)] flex-1 flex-col overflow-hidden rounded-[1.35rem] border border-border/70 bg-background shadow-[0_1px_0_rgba(15,23,42,0.03)] md:min-h-[calc(100svh-1.5rem)]">
          <header className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-3 md:px-4">
            <div className="flex items-center gap-3">
            <SidebarTrigger className="rounded-xl border border-border bg-background shadow-none hover:bg-muted/70" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {activeWorkspace?.name ?? user?.name ?? "TaskHub"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? "Workspace shell"}
              </p>
            </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={() => router.push("/app/inbox")}
              >
                <Bell className="size-4.5" />
              </button>
              <ThemeToggle />
            </div>
          </header>

          <div className="flex-1 overflow-auto px-3 pb-3 md:px-4 md:pb-4">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
