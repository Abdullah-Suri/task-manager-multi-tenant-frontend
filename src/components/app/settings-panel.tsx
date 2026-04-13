"use client"

import { useMemo, useState } from "react"
import { useTheme } from "next-themes"
import {
  BellRing,
  BriefcaseBusiness,
  CheckCircle2,
  KeyRound,
  LoaderCircle,
  Palette,
  ShieldCheck,
  UserCircle2,
} from "lucide-react"
import { toast } from "sonner"

import { ThemeToggle } from "@/components/app/theme-toggle"
import {
  useConfirmTwoFactorMutation,
  useDisableTwoFactorMutation,
  useProfileQuery,
  useSetupTwoFactorMutation,
  useUpdateProfileMutation,
} from "@/features/auth/hooks"
import { env } from "@/lib/config/env"
import { useAuthStore } from "@/stores/auth-store"
import { useWorkspaceStore } from "@/stores/workspace-store"
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

const inputClassName =
  "h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

export function SettingsPanel() {
  const { resolvedTheme } = useTheme()
  const user = useAuthStore((state) => state.user)
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const accessToken = useAuthStore((state) => state.accessToken)
  const activeWorkspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const { data: profile } = useProfileQuery(isHydrated && Boolean(accessToken))

  const [name, setName] = useState(user?.name ?? "")
  const [password, setPassword] = useState("")
  const [confirmToken, setConfirmToken] = useState("")
  const [disableToken, setDisableToken] = useState("")

  const updateProfileMutation = useUpdateProfileMutation()
  const setupTwoFactorMutation = useSetupTwoFactorMutation()
  const confirmTwoFactorMutation = useConfirmTwoFactorMutation()
  const disableTwoFactorMutation = useDisableTwoFactorMutation()

  const profileName = profile?.name ?? user?.name ?? "Workspace user"
  const profileEmail = profile?.email ?? user?.email ?? "No email available"
  const twoFactorEnabled = Boolean(user?.isTwoFactorEnabled)

  const setupData = useMemo(
    () => setupTwoFactorMutation.data ?? null,
    [setupTwoFactorMutation.data]
  )

  const submitProfileUpdate = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: name.trim() || undefined,
        password: password.trim() || undefined,
      })
      setPassword("")
      toast.success("Account details updated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update profile.")
    }
  }

  const startTwoFactorSetup = async () => {
    try {
      await setupTwoFactorMutation.mutateAsync()
      toast.success("Scan the QR code to continue setting up two-factor sign-in.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start 2FA setup.")
    }
  }

  const confirmTwoFactor = async () => {
    try {
      await confirmTwoFactorMutation.mutateAsync({ token: confirmToken })
      setConfirmToken("")
      toast.success("Two-factor sign-in is now enabled.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not confirm 2FA setup.")
    }
  }

  const disableTwoFactor = async () => {
    try {
      await disableTwoFactorMutation.mutateAsync({ token: disableToken })
      setDisableToken("")
      toast.success("Two-factor sign-in has been turned off.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not disable 2FA.")
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-background shadow-sm">
        <div className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(248,247,255,0.95),rgba(240,248,246,0.92))] px-6 py-8 dark:bg-[linear-gradient(135deg,rgba(30,28,45,0.95),rgba(23,38,39,0.9))]">
          <p className="text-xs font-medium tracking-[0.24em] uppercase text-muted-foreground">
            Settings
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Personalize your workspace
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Manage your account details, choose your appearance, and control how you
            sign in.
          </p>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-linear-to-br from-sky-400 via-fuchsia-500 to-orange-400 text-lg font-semibold text-white">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={profileName}
                  className="size-16 rounded-full object-cover"
                />
              ) : (
                getInitials(profileName)
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profileName}</h2>
              <p className="text-sm text-muted-foreground">{profileEmail}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <CompactMetric
              label="Theme"
              value={resolvedTheme === "dark" ? "Dark" : "Light"}
              icon={Palette}
            />
            <CompactMetric
              label="Workspace"
              value={activeWorkspaceId ? "Selected" : "Pending"}
              icon={BriefcaseBusiness}
            />
            <CompactMetric
              label="Two-factor"
              value={twoFactorEnabled ? "Enabled" : "Optional"}
              icon={ShieldCheck}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
              <UserCircle2 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Account details</h2>
              <p className="text-sm text-muted-foreground">
                Update your display name and password for this account.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="settings-name">
                Display name
              </label>
              <input
                id="settings-name"
                className={inputClassName}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="settings-email">
                Email
              </label>
              <input
                id="settings-email"
                className={`${inputClassName} opacity-80`}
                value={profileEmail}
                disabled
                readOnly
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium" htmlFor="settings-password">
                New password
              </label>
              <input
                id="settings-password"
                type="password"
                className={inputClassName}
                placeholder="Leave blank to keep your current password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Password changes are optional and can be updated at any time.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <Button
              size="lg"
              onClick={submitProfileUpdate}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? <LoaderCircle className="animate-spin" /> : null}
              Save account changes
            </Button>
          </div>
        </article>

        <article className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
              <Palette className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Choose how the app looks in every session.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background p-4">
              <p className="text-sm font-medium">Theme mode</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Switch between light, dark, or system mode.
              </p>
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background p-4">
              <p className="text-sm font-medium">Current appearance</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The app shell responds to your selected theme.
              </p>
              <div className="mt-4 rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
                Active mode:{" "}
                <span className="font-medium text-foreground">
                  {resolvedTheme === "dark" ? "Dark" : "Light"}
                </span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Two-factor sign-in</h2>
              <p className="text-sm text-muted-foreground">
                Add an extra verification step for account access.
              </p>
            </div>
          </div>

          {!twoFactorEnabled ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-border/60 bg-background p-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Start setup to generate a QR code and secret key for your authenticator app.
                </p>
                <div className="mt-4">
                  <Button onClick={startTwoFactorSetup} disabled={setupTwoFactorMutation.isPending}>
                    {setupTwoFactorMutation.isPending ? (
                      <LoaderCircle className="animate-spin" />
                    ) : null}
                    Start setup
                  </Button>
                </div>
              </div>

              {setupData ? (
                <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={setupData.qrCodeUrl}
                      alt="Scan this QR code with your authenticator app"
                      className="size-full rounded-xl border border-border/60 bg-white object-contain p-2"
                    />
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-sm font-medium">Manual setup key</p>
                    <p className="mt-2 break-all rounded-2xl bg-muted px-4 py-3 font-mono text-xs">
                      {setupData.secret}
                    </p>
                    <div className="mt-4 space-y-2">
                      <label className="text-sm font-medium" htmlFor="confirm-2fa">
                        Enter the 6-digit code to finish setup
                      </label>
                      <input
                        id="confirm-2fa"
                        inputMode="numeric"
                        className={inputClassName}
                        placeholder="123456"
                        value={confirmToken}
                        onChange={(event) => setConfirmToken(event.target.value)}
                      />
                    </div>
                    <div className="mt-4">
                      <Button
                        onClick={confirmTwoFactor}
                        disabled={confirmTwoFactorMutation.isPending || !confirmToken.trim()}
                      >
                        {confirmTwoFactorMutation.isPending ? (
                          <LoaderCircle className="animate-spin" />
                        ) : null}
                        Confirm setup
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-950 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 text-emerald-700 dark:text-emerald-300" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                      Extra verification is enabled
                    </p>
                    <p className="mt-1 text-sm leading-6 text-emerald-700/90 dark:text-emerald-200/80">
                      You will be asked for a one-time code after entering your password.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background p-4">
                <label className="text-sm font-medium" htmlFor="disable-2fa">
                  Verification code to disable two-factor sign-in
                </label>
                <input
                  id="disable-2fa"
                  inputMode="numeric"
                  className={`${inputClassName} mt-3`}
                  placeholder="123456"
                  value={disableToken}
                  onChange={(event) => setDisableToken(event.target.value)}
                />
                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={disableTwoFactor}
                    disabled={disableTwoFactorMutation.isPending || !disableToken.trim()}
                  >
                    {disableTwoFactorMutation.isPending ? (
                      <LoaderCircle className="animate-spin" />
                    ) : null}
                    Disable two-factor sign-in
                  </Button>
                </div>
              </div>
            </div>
          )}
        </article>

        <div className="grid gap-4">
          <ServiceCard
            title="Google sign-in"
            description="Use your Google account for a faster sign-in flow."
            status={env.googleClientId ? "Ready" : "Needs setup"}
            icon={KeyRound}
          />
          <ServiceCard
            title="Notifications"
            description="Keep updates visible so nothing slips through the cracks."
            status="Available"
            icon={BellRing}
          />
          <ServiceCard
            title="Workspace access"
            description="Your current workspace is remembered so you can jump back in quickly."
            status={activeWorkspaceId ? "Remembered" : "Not selected"}
            icon={BriefcaseBusiness}
          />
        </div>
      </section>
    </div>
  )
}

function CompactMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <article className="rounded-2xl border border-border/60 bg-card px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </article>
  )
}

function ServiceCard({
  title,
  description,
  status,
  icon: Icon,
}: {
  title: string
  description: string
  status: string
  icon: React.ComponentType<{ className?: string }>
}) {
  const positive =
    status === "Ready" || status === "Available" || status === "Remembered"

  return (
    <article className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
          <Icon className="size-5" />
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
            positive
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
          }`}
        >
          <CheckCircle2 className="size-3.5" />
          {status}
        </span>
      </div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </article>
  )
}
