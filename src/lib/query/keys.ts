export const queryKeys = {
  auth: {
    profile: ["auth", "profile"] as const,
  },
  workspaces: {
    all: ["workspaces"] as const,
    list: (search?: string) => ["workspaces", "list", search ?? ""] as const,
    detail: (workspaceId: number) => ["workspaces", workspaceId] as const,
  },
  projects: {
    list: (workspaceId: number, search?: string) =>
      ["projects", workspaceId, search ?? ""] as const,
  },
  tasks: {
    list: (workspaceId: number, projectId: number, filters?: Record<string, string>) =>
      ["tasks", workspaceId, projectId, filters ?? {}] as const,
  },
  notifications: {
    list: ["notifications"] as const,
  },
}
