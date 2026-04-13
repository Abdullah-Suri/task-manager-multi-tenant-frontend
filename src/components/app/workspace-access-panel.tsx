"use client"

import { useMemo, useState } from "react"
import { MailPlus, Shield, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import { useCreateInviteMutation } from "@/features/invites/hooks"
import {
  useMembersQuery,
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} from "@/features/members/hooks"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Workspace, WorkspaceMember } from "@/types/api"

const fallbackRoles = [
  { id: 1, name: "OWNER", description: "Full control over the workspace" },
  { id: 2, name: "ADMIN", description: "Can manage team access and workspace setup" },
  { id: 3, name: "MEMBER", description: "Can contribute to work and updates" },
] as const

const inputClassName =
  "h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"

function roleLabel(name?: string) {
  if (!name) {
    return "Member"
  }

  return name.charAt(0) + name.slice(1).toLowerCase()
}

export function WorkspaceAccessPanel({ workspace }: { workspace: Workspace }) {
  const { data: members = [], isLoading } = useMembersQuery(workspace.id)
  const updateMemberRoleMutation = useUpdateMemberRoleMutation()
  const removeMemberMutation = useRemoveMemberMutation()
  const createInviteMutation = useCreateInviteMutation()

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRoleId, setInviteRoleId] = useState<string>("3")

  const availableRoles = useMemo(() => {
    const roleMap = new Map<number, { id: number; name: string; description?: string | null }>()

    fallbackRoles.forEach((role) => {
      roleMap.set(role.id, { ...role })
    })

    members.forEach((member) => {
      if (member.role?.id) {
        roleMap.set(member.role.id, {
          id: member.role.id,
          name: member.role.name,
          description: member.role.description,
        })
      }
    })

    return [...roleMap.values()].sort((left, right) => left.id - right.id)
  }, [members])

  const inviteMember = async () => {
    if (!inviteEmail.trim()) {
      return
    }

    try {
      await createInviteMutation.mutateAsync({
        workspaceId: workspace.id,
        email: inviteEmail.trim(),
        roleId: Number(inviteRoleId),
      })
      setInviteEmail("")
      setInviteRoleId("3")
      toast.success("Invitation sent.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send invitation.")
    }
  }

  const changeMemberRole = async (member: WorkspaceMember, nextRoleId: string) => {
    try {
      await updateMemberRoleMutation.mutateAsync({
        workspaceId: workspace.id,
        userId: member.userId,
        roleId: Number(nextRoleId),
      })
      toast.success("Role updated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update role.")
    }
  }

  const removeMember = async (member: WorkspaceMember) => {
    try {
      await removeMemberMutation.mutateAsync({
        workspaceId: workspace.id,
        userId: member.userId,
      })
      toast.success("Member removed.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove member.")
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-background shadow-sm">
        <div className="border-b border-border/60 px-6 py-8">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Team access
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{workspace.name}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage who can join this workspace and what level of access each person has.
          </p>
        </div>

        <div className="grid gap-4 px-6 py-6 xl:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-[1.75rem] border border-border/60 bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
                <Users className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Members</h3>
                <p className="text-sm text-muted-foreground">
                  Review the people who currently have access to this workspace.
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50 text-left text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-t border-border/60">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium">
                            {member.user?.name ?? member.user?.email ?? `Member ${member.userId}`}
                          </p>
                          {member.user?.email ? (
                            <p className="mt-1 text-xs text-muted-foreground">{member.user.email}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Select
                          value={String(member.role?.id ?? member.roleId ?? 3)}
                          onValueChange={(value) => changeMemberRole(member, value)}
                          disabled={
                            updateMemberRoleMutation.isPending ||
                            member.role?.name === "OWNER"
                          }
                        >
                          <SelectTrigger className="h-10 w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableRoles.map((role) => (
                              <SelectItem key={role.id} value={String(role.id)}>
                                {roleLabel(role.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeMember(member)}
                            disabled={
                              removeMemberMutation.isPending || member.role?.name === "OWNER"
                            }
                          >
                            <Trash2 className="size-4" />
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!members.length && !isLoading ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                      >
                        No members found for this workspace yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </article>

          <div className="grid gap-4">
            <article className="rounded-[1.75rem] border border-border/60 bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
                  <MailPlus className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Invite someone</h3>
                  <p className="text-sm text-muted-foreground">
                    Send an invitation and decide the access level up front.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="invite-email">
                    Email address
                  </label>
                  <input
                    id="invite-email"
                    className={inputClassName}
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    placeholder="teammate@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Access level</label>
                  <Select value={inviteRoleId} onValueChange={setInviteRoleId}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles
                        .filter((role) => role.name !== "OWNER")
                        .map((role) => (
                          <SelectItem key={role.id} value={String(role.id)}>
                            {roleLabel(role.name)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={inviteMember}
                  disabled={createInviteMutation.isPending || !inviteEmail.trim()}
                >
                  Send invitation
                </Button>
              </div>
            </article>

            <article className="rounded-[1.75rem] border border-border/60 bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
                  <Shield className="size-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Role guide</h3>
                  <p className="text-sm text-muted-foreground">
                    A simple overview of what each access level is meant for.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {availableRoles.map((role) => (
                  <div key={role.id} className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="font-medium">{roleLabel(role.name)}</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {role.description ??
                        (role.name === "OWNER"
                          ? "Full control over the workspace, people, and setup."
                          : role.name === "ADMIN"
                            ? "Can organize work and manage team access."
                            : "Can contribute to projects, tasks, and updates.")}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}
