"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"

import {
  useCreateWorkspaceMutation,
  useResolvedWorkspaceSelection,
  useUpdateWorkspaceMutation,
} from "@/features/workspaces/hooks"
import { WorkspaceAccessPanel } from "@/components/app/workspace-access-panel"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 5

export function WorkspacesTable() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [newWorkspaceName, setNewWorkspaceName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const { workspaces, activeWorkspace, selectWorkspace } = useResolvedWorkspaceSelection()
  const createWorkspaceMutation = useCreateWorkspaceMutation()
  const updateWorkspaceMutation = useUpdateWorkspaceMutation()

  const filtered = useMemo(
    () =>
      workspaces.filter((workspace) =>
        workspace.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, workspaces]
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      return
    }

    try {
      await createWorkspaceMutation.mutateAsync({ name: newWorkspaceName.trim() })
      setNewWorkspaceName("")
      toast.success("Workspace created.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create workspace.")
    }
  }

  const saveWorkspace = async () => {
    if (!editingId || !editingName.trim()) {
      return
    }

    try {
      await updateWorkspaceMutation.mutateAsync({
        workspaceId: editingId,
        name: editingName.trim(),
      })
      setEditingId(null)
      setEditingName("")
      toast.success("Workspace updated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update workspace.")
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-background shadow-sm mt-4">
        <div className="border-b border-border/60 px-6 py-8">
          <p className="text-xs font-medium tracking-[0.24em] uppercase text-muted-foreground">
            Workspaces
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Manage workspace records</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Create, rename, search, and page through workspaces from a dedicated management view.
          </p>
        </div>
        <div className="grid gap-4 px-6 py-5 lg:grid-cols-[1fr_320px]">
          <div className="relative">
            <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-11 w-full rounded-2xl border border-input bg-background ps-11 pe-4 text-sm outline-none"
              placeholder="Search workspace names"
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
              placeholder="New workspace"
              value={newWorkspaceName}
              onChange={(event) => setNewWorkspaceName(event.target.value)}
            />
            <Button onClick={createWorkspace} disabled={createWorkspaceMutation.isPending}>
              Add
            </Button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((workspace) => (
                <tr key={workspace.id} className="border-t border-border/60">
                  <td className="px-6 py-4">
                    {editingId === workspace.id ? (
                      <input
                        className="h-10 w-full rounded-xl border border-input bg-background px-3 outline-none"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                      />
                    ) : (
                      <span className="font-medium">{workspace.name}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {activeWorkspace?.id === workspace.id ? "Active" : "Available"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      {editingId === workspace.id ? (
                        <Button size="sm" variant="outline" onClick={saveWorkspace}>
                          Save
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(workspace.id)
                            setEditingName(workspace.name)
                          }}
                        >
                          Rename
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => {
                          selectWorkspace(workspace.id)
                          toast.success("Workspace switched.")
                        }}
                      >
                        Open
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

      {activeWorkspace ? <WorkspaceAccessPanel workspace={activeWorkspace} /> : null}
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
