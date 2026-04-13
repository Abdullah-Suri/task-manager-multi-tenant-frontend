"use client"

import { ProjectBoard } from "@/components/app/project-board"
import { useProjectsQuery } from "@/features/projects/hooks"
import { useTasksQuery } from "@/features/tasks/hooks"
import { useResolvedWorkspaceSelection } from "@/features/workspaces/hooks"
import { useWorkspaceStore } from "@/stores/workspace-store"

export default function BoardPage() {
  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId)
  const { activeWorkspace } = useResolvedWorkspaceSelection()
  const { data: projects = [] } = useProjectsQuery(activeWorkspace?.id ?? null)
  const activeProject =
    projects.find((project) => project.id === activeProjectId) ?? projects[0] ?? null
  const { data: taskData } = useTasksQuery(activeWorkspace?.id ?? null, activeProject?.id ?? null)

  return (
    <ProjectBoard
      workspace={activeWorkspace}
      project={activeProject}
      tasks={taskData?.tasks ?? []}
    />
  )
}
