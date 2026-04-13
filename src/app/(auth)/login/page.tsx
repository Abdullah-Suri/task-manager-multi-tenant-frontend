import Link from "next/link"

import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      description="Pick up where your team left off and get back to the work that matters."
      footer={
        <span>
          New here?{" "}
          <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </span>
      }
    >
      <AuthForm mode="login" />
    </AuthShell>
  )
}
