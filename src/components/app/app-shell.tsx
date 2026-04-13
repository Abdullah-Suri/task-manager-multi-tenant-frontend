import { Bell, BriefcaseBusiness, FolderKanban, ShieldCheck, Workflow } from "lucide-react"

import { Button } from "@/components/ui/button"

const stackItems = [
  "TanStack Query for server state and pagination",
  "Axios client with token injection and refresh retries",
  "Zustand stores for auth session and active workspace",
  "React Hook Form plus Zod ready for form flows",
  "Socket.IO client ready for realtime notifications",
  "dnd-kit installed for task board interactions",
]

const roadmapItems = [
  {
    title: "Auth",
    description: "JWT, refresh tokens, Google login, and optional 2FA flows.",
    icon: ShieldCheck,
  },
  {
    title: "Workspace",
    description: "Workspace-scoped navigation and multi-tenant routing decisions.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Projects",
    description: "Project lists and detail surfaces inside the active workspace.",
    icon: FolderKanban,
  },
  {
    title: "Tasks",
    description: "Kanban board, drag and drop, filtering, uploads, and comments.",
    icon: Workflow,
  },
  {
    title: "Notifications",
    description: "Realtime and paginated notification center using Socket.IO.",
    icon: Bell,
  },
]

export function AppShell() {
  return (
    <main className="min-h-svh bg-[radial-gradient(circle_at_top,oklch(0.98_0.02_85),transparent_35%),linear-gradient(180deg,oklch(0.99_0_0),oklch(0.96_0.01_95))] text-foreground dark:bg-[radial-gradient(circle_at_top,oklch(0.28_0.03_260),transparent_28%),linear-gradient(180deg,oklch(0.15_0_0),oklch(0.18_0.01_250))]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 lg:px-10">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium tracking-[0.2em] uppercase backdrop-blur">
            TaskHub Frontend Foundation
          </span>
          <div className="max-w-3xl space-y-4">
            <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
              Frontend foundation is in place for the SaaS task manager.
            </h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              The project is prepared for UI construction and backend integration across
              auth, workspace-scoped data, tasks, notifications, and drag-and-drop flows.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg">Build UI Next</Button>
            <Button variant="outline" size="lg">
              Connect API Layer
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Selected Tech Stack</h2>
                <p className="text-sm text-muted-foreground">
                  Lean client architecture aligned with your backend contract.
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {stackItems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm leading-6"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Current App Readiness</h2>
            <div className="mt-4 grid gap-4">
              {roadmapItems.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  className="flex gap-3 rounded-2xl border border-border/60 bg-background px-4 py-4"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
