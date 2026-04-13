"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"

import { useCreateProjectMutation, useProjectsQuery, useUpdateProjectMutation } from "@/features/projects/hooks"
import { useResolvedWorkspaceSelection } from "@/features/workspaces/hooks"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 6

export function ProjectsTable() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [newProjectName, setNewProjectName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const { activeWorkspace } = useResolvedWorkspaceSelection()
  const { data: projects = [] } = useProjectsQuery(activeWorkspace?.id ?? null)
  const setActiveProjectId = useWorkspaceStore((state) => state.setActiveProjectId)
  const createProjectMutation = useCreateProjectMutation()
  const updateProjectMutation = useUpdateProjectMutation()

  const filtered = useMemo(
    () => projects.filter((project) => project.name.toLowerCase().includes(search.toLowerCase())),
    [projects, search]
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const createProject = async () => {
    if (!activeWorkspace?.id || !newProjectName.trim()) {
      return
    }

    try {
      await createProjectMutation.mutateAsync({
        workspaceId: activeWorkspace.id,
        name: newProjectName.trim(),
      })
      setNewProjectName("")
      toast.success("Project created.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create project.")
    }
  }

  const saveProject = async () => {
    if (!activeWorkspace?.id || !editingId || !editingName.trim()) {
      return
    }

    try {
      await updateProjectMutation.mutateAsync({
        workspaceId: activeWorkspace.id,
        projectId: editingId,
        name: editingName.trim(),
      })
      setEditingId(null)
      setEditingName("")
      toast.success("Project updated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update project.")
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-background shadow-sm">
        <div className="border-b border-border/60 px-6 py-8">
          <p className="text-xs font-medium tracking-[0.24em] uppercase text-muted-foreground">
            Projects
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {activeWorkspace ? `${activeWorkspace.name} projects` : "Projects"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage project records with clear search, pagination, and quick selection.
          </p>
        </div>
        <div className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_320px]">
          <div className="relative">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-11 w-full rounded-2xl border border-input bg-background ps-11 pe-4 text-sm outline-none"
              placeholder="Search projects"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </div>
          <div className="flex gap-2">
            <input
              className="h-11 flex-1 rounded-2xl border border-input bg-background px-4 text-sm outline-none"
              placeholder="New project"
              value={newProjectName}
              onChange={(event) => setNewProjectName(event.target.value)}
            />
            <Button onClick={createProject} disabled={!activeWorkspace?.id || createProjectMutation.isPending}>
              Add
            </Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Workspace</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((project) => (
                <tr key={project.id} className="border-t border-border/60">
                  <td className="px-6 py-4">
                    {editingId === project.id ? (
                      <input
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 outline-none"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                      />
                    ) : (
                      <span className="font-medium">{project.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{activeWorkspace?.name ?? "Workspace"}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {editingId === project.id ? (
                        <Button size="sm" variant="outline" onClick={saveProject}>
                          Save
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(project.id)
                            setEditingName(project.name)
                          }}
                        >
                          Rename
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          setActiveProjectId(project.id)
                          toast.success("Project selected.")
                        }}
                      >
                        Select
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </section>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between border-t border-border/60 px-6 py-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
