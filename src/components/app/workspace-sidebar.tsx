"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  FolderKanban,
  LayoutDashboard,
  Settings2,
  Workflow,
} from "lucide-react"

import { useProjectsQuery } from "@/features/projects/hooks"
import { useResolvedWorkspaceSelection } from "@/features/workspaces/hooks"
import { useWorkspaceStore } from "@/stores/workspace-store"
import { UserNav } from "@/components/app/user-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const primaryItems = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/workspaces", label: "Workspaces", icon: Building2 },
  { href: "/app/projects", label: "Projects", icon: FolderKanban },
  { href: "/app/board", label: "Board", icon: Workflow },
  { href: "/app/inbox", label: "Inbox", icon: Bell },
  { href: "/app/settings", label: "Settings", icon: Settings2 },
]

export function WorkspaceSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId)
  const setActiveProjectId = useWorkspaceStore((state) => state.setActiveProjectId)
  const { activeWorkspace, workspaces, selectWorkspace } = useResolvedWorkspaceSelection()
  const { data: projects = [] } = useProjectsQuery(activeWorkspace?.id ?? null)

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="border-r border-sidebar-border/80 bg-sidebar/95"
    >
      <SidebarHeader className="px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-auto w-full items-center justify-between rounded-2xl border border-sidebar-border/70 bg-sidebar px-3 py-3 text-left shadow-none transition hover:bg-sidebar-accent/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                  <BriefcaseBusiness className="size-4" />
                </div>
                <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-sm font-semibold text-sidebar-foreground">
                    {activeWorkspace?.name ?? "Choose a workspace"}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/60">
                    Switch workspace
                  </p>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => {
                  selectWorkspace(workspace.id)
                  setActiveProjectId(null)
                  router.push("/app")
                }}
              >
                <BriefcaseBusiness />
                {workspace.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-3">
        <SidebarGroup className="px-1">
          <SidebarGroupLabel className="px-2 text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-sidebar-foreground/50">
            Navigate
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {primaryItems.map(({ href, label, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={label}
                    isActive={pathname === href}
                    className="h-10 rounded-xl px-2.5 text-[15px] font-medium data-[active=true]:bg-sidebar-accent/70"
                  >
                    <Link href={href}>
                      <Icon className="size-4.5" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="px-1 pt-4">
          <SidebarGroupLabel className="px-2 text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-sidebar-foreground/50">
            Projects
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    tooltip={project.name}
                    isActive={activeProjectId === project.id && pathname === "/app/board"}
                    className="h-10 rounded-xl px-2.5 text-[15px] font-medium"
                    onClick={() => {
                      setActiveProjectId(project.id)
                      router.push("/app/board")
                    }}
                  >
                    <FolderKanban className="size-4.5" />
                    <span>{project.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {!projects.length ? (
                <div className="px-2 py-3 text-sm text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden">
                  No projects yet.
                </div>
              ) : null}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="mt-auto px-3 py-3">
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  )
}
