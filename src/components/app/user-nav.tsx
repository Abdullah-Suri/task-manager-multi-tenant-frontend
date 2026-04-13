"use client"

import { ChevronUp, LogOut, Moon, Settings, Sun, UserCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import { useLogoutMutation } from "@/features/auth/hooks"
import { useAuthStore } from "@/stores/auth-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

function getInitials(name?: string | null) {
  if (!name) {
    return "TH"
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0]?.toUpperCase())
    .join("")
}

export function UserNav() {
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const user = useAuthStore((state) => state.user)
  const logoutMutation = useLogoutMutation()

  const userName = user?.name ?? "Workspace user"
  const userEmail = user?.email ?? ""

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-between rounded-2xl border border-transparent px-2 py-2 hover:bg-sidebar-accent/40"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-sky-400 via-fuchsia-500 to-orange-400 text-xs font-semibold text-white">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={userName}
                  className="size-9 rounded-full object-cover"
                />
              ) : (
                getInitials(userName)
              )}
            </div>
            <div className="min-w-0 text-left group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold text-sidebar-foreground">
                {userName}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">{userEmail}</p>
            </div>
          </div>
          <ChevronUp className="size-4 text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/app/settings")}>
          <Settings />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
          {resolvedTheme === "dark" ? <Sun /> : <Moon />}
          Switch appearance
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/app/settings")}>
          <UserCircle2 />
          Account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            logoutMutation.mutate()
            router.push("/login")
          }}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
