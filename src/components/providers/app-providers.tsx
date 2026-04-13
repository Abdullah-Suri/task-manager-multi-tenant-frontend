"use client"

import { GoogleOAuthProvider } from "@react-oauth/google"
import { Toaster } from "sonner"

import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { env } from "@/lib/config/env"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppProviders({ children }: { children: React.ReactNode }) {
  const content = (
    <ThemeProvider>
      <TooltipProvider>
        <QueryProvider>
          {children}
          <Toaster richColors position="top-right" />
        </QueryProvider>
      </TooltipProvider>
    </ThemeProvider>
  )

  if (!env.googleClientId) {
    return content
  }

  return (
    <GoogleOAuthProvider clientId={env.googleClientId}>{content}</GoogleOAuthProvider>
  )
}
