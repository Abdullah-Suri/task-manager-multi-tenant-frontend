import { ProtectedAppShell } from "@/components/app/protected-app-shell"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedAppShell>{children}</ProtectedAppShell>
}
