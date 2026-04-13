"use client"

import { startTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react"
import { toast } from "sonner"

import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/features/auth/schemas"
import { useLoginMutation, useRegisterMutation } from "@/features/auth/hooks"
import { Button } from "@/components/ui/button"
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button"

const inputClassName =
  "h-12 w-full rounded-2xl border border-input bg-background ps-11 pe-4 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

type Mode = "login" | "register"

export function AuthForm({ mode }: { mode: Mode }) {
  if (mode === "register") {
    return <RegisterForm />
  }

  return <LoginForm />
}

function LoginForm() {
  const router = useRouter()
  const loginMutation = useLoginMutation()
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = await loginMutation.mutateAsync(values)

      startTransition(() => {
        if ("is2FARequired" in payload) {
          router.push("/two-factor")
          return
        }

        router.push("/app")
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.")
    }
  })

  return (
    <div className="space-y-4">
      <GoogleSignInButton />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 tracking-[0.22em] text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              className={inputClassName}
              {...form.register("email")}
            />
          </div>
          <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type="password"
              className={inputClassName}
              {...form.register("password")}
            />
          </div>
          <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? <LoaderCircle className="animate-spin" /> : null}
          Sign in
          {!loginMutation.isPending ? <ArrowRight data-icon="inline-end" /> : null}
        </Button>
      </form>
    </div>
  )
}

function RegisterForm() {
  const router = useRouter()
  const registerMutation = useRegisterMutation()
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const payload = await registerMutation.mutateAsync(values)

      startTransition(() => {
        if ("is2FARequired" in payload) {
          router.push("/two-factor")
          return
        }

        router.push("/app")
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.")
    }
  })

  return (
    <div className="space-y-4">
      <GoogleSignInButton />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-3 tracking-[0.22em] text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="name">
            Full name
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input id="name" className={inputClassName} {...form.register("name")} />
          </div>
          <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              className={inputClassName}
              {...form.register("email")}
            />
          </div>
          <p className="text-xs text-destructive">{form.formState.errors.email?.message}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type="password"
              className={inputClassName}
              {...form.register("password")}
            />
          </div>
          <p className="text-xs text-destructive">{form.formState.errors.password?.message}</p>
          <p className="text-xs text-muted-foreground">
            Use at least 6 characters to get started.
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? <LoaderCircle className="animate-spin" /> : null}
          Create account
          {!registerMutation.isPending ? <ArrowRight data-icon="inline-end" /> : null}
        </Button>
      </form>
    </div>
  )
}
