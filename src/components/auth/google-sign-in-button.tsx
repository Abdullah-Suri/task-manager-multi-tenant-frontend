"use client"

import { startTransition } from "react"
import { useRouter } from "next/navigation"
import { GoogleLogin } from "@react-oauth/google"
import { toast } from "sonner"

import { useGoogleLoginMutation } from "@/features/auth/hooks"
import { env } from "@/lib/config/env"
import { Button } from "@/components/ui/button"

export function GoogleSignInButton() {
  const router = useRouter()
  const mutation = useGoogleLoginMutation()

  if (!env.googleClientId) {
    return (
      <Button type="button" variant="outline" size="lg" className="w-full" disabled>
        Google sign-in unavailable
      </Button>
    )
  }

  return (
    <div className="flex justify-center rounded-2xl px-3 py-3">
      <GoogleLogin
        shape="pill"
        size="large"
        text="continue_with"
        width="320"
        onSuccess={async (credentialResponse) => {
          if (!credentialResponse.credential) {
            toast.error("Google sign-in did not return a valid credential.")
            return
          }

          try {
            const payload = await mutation.mutateAsync({
              idToken: credentialResponse.credential,
            })

            startTransition(() => {
              if ("is2FARequired" in payload) {
                router.push("/two-factor")
                return
              }

              router.push("/app")
            })
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Google sign-in failed.")
          }
        }}
        onError={() => {
          toast.error("Google sign-in failed.")
        }}
      />
    </div>
  )
}
