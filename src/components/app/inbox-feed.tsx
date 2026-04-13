"use client"

import { format, formatDistanceToNowStrict, isToday, isYesterday, parseISO } from "date-fns"
import { BellRing, CheckCheck, Dot, Inbox, Sparkles } from "lucide-react"

import { useNotificationsQuery } from "@/features/notifications/hooks"
import type { NotificationItem } from "@/types/api"

function groupLabel(dateValue: string) {
  const date = parseISO(dateValue)

  if (isToday(date)) {
    return "Today"
  }

  if (isYesterday(date)) {
    return "Yesterday"
  }

  return format(date, "MMMM d")
}

function groupNotifications(notifications: NotificationItem[]) {
  return notifications.reduce<Record<string, NotificationItem[]>>((groups, notification) => {
    const key = groupLabel(notification.createdAt)
    groups[key] ??= []
    groups[key].push(notification)
    return groups
  }, {})
}

function relativeTime(value: string) {
  return formatDistanceToNowStrict(parseISO(value), { addSuffix: true })
}

export function InboxFeed() {
  const { data, isLoading } = useNotificationsQuery()
  const notifications = data?.notifications ?? []
  const grouped = groupNotifications(notifications)
  const sections = Object.entries(grouped)

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-background shadow-sm mt-4">
        <div className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(244,248,255,0.95),rgba(244,238,255,0.86))] px-6 py-8 dark:bg-[linear-gradient(135deg,rgba(26,36,53,0.96),rgba(34,27,49,0.9))]">
          <p className="text-xs font-medium tracking-[0.24em] uppercase text-muted-foreground">
            Inbox
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Stay on top of what changed
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Review assignments, mentions, and important updates without losing momentum.
          </p>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-3">
          <MetricCard
            label="Unread"
            value={String(data?.unreadCount ?? 0)}
            hint="Items that still need attention"
            icon={BellRing}
          />
          <MetricCard
            label="Total updates"
            value={String(notifications.length)}
            hint="Loaded in the current view"
            icon={Inbox}
          />
          <MetricCard
            label="Status"
            value={data?.unreadCount ? "Active" : "Clear"}
            hint={data?.unreadCount ? "There is fresh activity to review" : "You are caught up"}
            icon={data?.unreadCount ? Sparkles : CheckCheck}
          />
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-[2rem] border border-border/60 bg-card px-6 py-14 text-center text-sm text-muted-foreground shadow-sm">
          Loading updates...
        </section>
      ) : null}

      {!isLoading && !notifications.length ? (
        <section className="rounded-[2rem] border border-dashed border-border bg-card px-6 py-14 text-center shadow-sm">
          <div className="mx-auto max-w-md space-y-3">
            <p className="text-lg font-semibold">Nothing new right now</p>
            <p className="text-sm leading-6 text-muted-foreground">
              New assignments and team activity will show up here as work starts moving.
            </p>
          </div>
        </section>
      ) : null}

      {!isLoading && notifications.length ? (
        <section className="space-y-6">
          {sections.map(([label, items]) => (
            <div key={label} className="space-y-3">
              <div className="flex items-center gap-3 px-1">
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground">
                  {label}
                </p>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-3">
                {items.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  )
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <article className="rounded-2xl border border-border/60 bg-card px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </article>
  )
}

function NotificationCard({ notification }: { notification: NotificationItem }) {
  return (
    <article
      className={`rounded-[1.6rem] border px-5 py-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] ${
        notification.isRead
          ? "border-border/60 bg-background"
          : "border-sky-200 bg-sky-50/70 dark:border-sky-900 dark:bg-sky-950/20"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {!notification.isRead ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-medium text-sky-700 dark:bg-sky-950/50 dark:text-sky-200">
                <Dot className="size-4" />
                New
              </span>
            ) : null}
            <span className="text-xs text-muted-foreground">
              {relativeTime(notification.createdAt)}
            </span>
          </div>
          <h2 className="text-base font-semibold">{notification.title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{notification.message}</p>
        </div>
      </div>
    </article>
  )
}
