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
      <main className="relative flex min-h-svh items-center justify-center overflow-hidden px-6">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
          <div className="absolute bottom-10 left-10 h-56 w-56 rounded-full bg-muted blur-3xl dark:bg-muted/60" />
          <div className="absolute right-10 top-10 h-64 w-64 rounded-full bg-secondary/50 blur-3xl dark:bg-secondary/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,theme(colors.border/.25),transparent_45%)] dark:bg-[radial-gradient(circle_at_top,theme(colors.white/.06),transparent_35%)]" />
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-3xl border bg-card/80 p-8 shadow-sm backdrop-blur-xl">
            <div className="flex flex-col items-center text-center">
              {/* Loader */}
              <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 animate-pulse"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 12l2 2 4-4" />
                    <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 1 0 0 1.996c.055-.549-.398-.998-.95-.998Z" />
                  </svg>
                </div>
              </div>

              <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
                TaskHub
              </p>

              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                Checking your session
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Please wait while we securely restore your workspace and verify access.
              </p>

              {/* Progress dots */}
              {/* <div className="mt-6 flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary/80 [animation-delay:-0.15s]" />
                <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary/60" />
              </div> */}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <SidebarProvider>
      <WorkspaceSidebar />
      <SidebarInset className="min-h-svh bg-[linear-gradient(180deg,oklch(0.995_0.004_95),oklch(0.972_0.01_95))] dark:bg-[linear-gradient(180deg,oklch(0.16_0.01_260),oklch(0.19_0.01_260))] m-0!">
        <div className="flex min-h-[calc(100svh-1rem)] flex-1 flex-col overflow-hidden border border-border/70 bg-background shadow-[0_1px_0_rgba(15,23,42,0.03)] md:min-h-[calc(100svh-1.5rem)]">
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
              {/* <ThemeToggle /> */}
            </div>
          </header>

          <div className="flex-1 overflow-auto px-3 pb-3 md:px-4 md:pb-4">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
