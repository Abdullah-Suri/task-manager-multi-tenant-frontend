"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type WorkspaceState = {
  activeWorkspaceId: number | null
  activeProjectId: number | null
  setActiveWorkspaceId: (workspaceId: number | null) => void
  setActiveProjectId: (projectId: number | null) => void
  reset: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeProjectId: null,
      setActiveWorkspaceId: (workspaceId) =>
        set({ activeWorkspaceId: workspaceId, activeProjectId: null }),
      setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
      reset: () => set({ activeWorkspaceId: null, activeProjectId: null }),
    }),
    {
      name: "taskhub-workspace",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
