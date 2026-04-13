"use client"

import { startTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import {
  verifyTwoFactorSchema,
  type VerifyTwoFactorValues,
} from "@/features/auth/schemas"
import { useVerifyTwoFactorMutation } from "@/features/auth/hooks"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"

const inputClassName =
  "h-14 w-full rounded-2xl border border-input bg-background px-4 text-center text-lg tracking-[0.35em] outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

export function TwoFactorForm() {
  const router = useRouter()
  const userId = useAuthStore((state) => state.twoFactorUserId)
  const mutation = useVerifyTwoFactorMutation()

  const form = useForm<VerifyTwoFactorValues>({
    resolver: zodResolver(verifyTwoFactorSchema),
    defaultValues: {
      userId: userId ?? 0,
      token: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync(values)
      startTransition(() => {
        router.push("/app")
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Verification failed.")
    }
  })

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-4.5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Extra confirmation required</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Enter the latest 6-digit code from your authenticator app to continue.
            </p>
          </div>
        </div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="token">
            Verification code
          </label>
          <input
            id="token"
            inputMode="numeric"
            placeholder="123456"
            className={inputClassName}
            {...form.register("token")}
          />
          <input type="hidden" {...form.register("userId", { valueAsNumber: true })} />
          <p className="text-xs text-destructive">{form.formState.errors.token?.message}</p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending || !userId}>
          {mutation.isPending ? <LoaderCircle className="animate-spin" /> : null}
          Verify and continue
          {!mutation.isPending ? <ArrowRight data-icon="inline-end" /> : null}
        </Button>
      </form>
    </div>
  )
}
