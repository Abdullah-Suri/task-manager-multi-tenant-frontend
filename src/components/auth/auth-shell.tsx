import Link from "next/link"
import { CheckCircle2, Layers3, ShieldCheck, Zap } from "lucide-react"

import { env } from "@/lib/config/env"

const trustPoints = [
  {
    title: "Clear project visibility",
    description: "See what is planned, active, and complete without bouncing between tools.",
    icon: Layers3,
  },
  {
    title: "Faster team follow-through",
    description: "Keep assignments, updates, and decisions moving in one shared workspace.",
    icon: Zap,
  },
  {
    title: "Protected access",
    description: "Sign in with secure session handling and optional extra verification.",
    icon: ShieldCheck,
  },
]

export function AuthShell({
  title,
  description,
  footer,
  children,
}: {
  title: string
  description: string
  footer: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <main className="grid min-h-svh lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r border-border/60 bg-[linear-gradient(160deg,oklch(0.98_0.03_85),oklch(0.93_0.06_80))] p-10 lg:flex lg:flex-col lg:justify-between dark:bg-[linear-gradient(160deg,oklch(0.22_0.03_250),oklch(0.14_0.01_260))]">
        <div className="space-y-6">
          <p className="text-sm font-medium tracking-[0.22em] uppercase text-muted-foreground">
            {env.appName}
          </p>
          <div className="space-y-4">
            <h2 className="max-w-lg text-4xl font-semibold tracking-tight">
              Keep the whole team aligned without slowing the work down.
            </h2>
            <p className="max-w-lg text-base leading-7 text-muted-foreground">
              Bring planning, updates, ownership, and progress into one calm workspace
              built for everyday execution.
            </p>
          </div>

          {/* <div className="grid grid-cols-3 gap-3">
            {trustPoints.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="col-span-1 rounded-3xl border border-border/60 bg-background/65 p-4 backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="size-4.5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </div>
              </article>
            ))}
          </div> */}
        </div>

        {/* <div className="rounded-3xl border border-border/60 bg-background/80 p-6 backdrop-blur">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-300" />
            Ready for day-to-day planning
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sign in to manage projects, review updates, and keep the team on the same page.
          </p>
        </div> */}
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-6 rounded-[2rem] border border-border/60 bg-background p-8 shadow-sm">
          <div className="space-y-2">
            <Link href="/" className="text-sm font-medium text-muted-foreground">
              {env.appName}
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {children}
          <div className="border-t border-border/60 pt-5 text-sm text-muted-foreground">
            {footer}
          </div>
        </div>
      </section>
    </main>
  )
}
