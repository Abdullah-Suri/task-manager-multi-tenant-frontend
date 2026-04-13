"use client"

import { useProjectsQuery } from "@/features/projects/hooks"
import { useTasksQuery } from "@/features/tasks/hooks"
import { useResolvedWorkspaceSelection } from "@/features/workspaces/hooks"
import { useWorkspaceStore } from "@/stores/workspace-store"

export function DashboardOverview() {
  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId)
  const { activeWorkspace } = useResolvedWorkspaceSelection()
  const { data: projects = [] } = useProjectsQuery(activeWorkspace?.id ?? null)
  const { data: taskData } = useTasksQuery(activeWorkspace?.id ?? null, activeProjectId)

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/60 bg-background p-6 shadow-sm">
        <p className="text-xs font-medium tracking-[0.24em] uppercase text-muted-foreground">
          Overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {activeWorkspace ? activeWorkspace.name : "Select a workspace"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Use the dedicated management views for workspaces and projects, then move into the board to manage execution.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border/60 bg-card p-5">
          <p className="text-sm text-muted-foreground">Active workspace</p>
          <p className="mt-2 text-3xl font-semibold">{activeWorkspace ? "1" : "0"}</p>
        </article>
        <article className="rounded-3xl border border-border/60 bg-card p-5">
          <p className="text-sm text-muted-foreground">Projects</p>
          <p className="mt-2 text-3xl font-semibold">{projects.length}</p>
        </article>
        <article className="rounded-3xl border border-border/60 bg-card p-5">
          <p className="text-sm text-muted-foreground">Tasks in selected project</p>
          <p className="mt-2 text-3xl font-semibold">{taskData?.tasks.length ?? 0}</p>
        </article>
      </section>
    </div>
  )
}
