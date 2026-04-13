import Link from "next/link"

import { AuthShell } from "@/components/auth/auth-shell"
import { TwoFactorForm } from "@/components/auth/two-factor-form"

export default function TwoFactorPage() {
  return (
    <AuthShell
      title="Two-factor verification"
      description="A quick verification step helps keep your workspace secure."
      footer={
        <span>
          Need to restart?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </span>
      }
    >
      <TwoFactorForm />
    </AuthShell>
  )
}
