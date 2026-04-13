import Link from "next/link"

import { AuthForm } from "@/components/auth/auth-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create account"
      description="Set up your account and start organizing projects, updates, and ownership in one place."
      footer={
        <span>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <AuthForm mode="register" />
    </AuthShell>
  )
}
