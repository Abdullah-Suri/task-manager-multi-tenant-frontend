export type ApiResponse<T> = {
  statusCode: number
  data: T
  message: string
  success: boolean
}

export type ApiErrorResponse = {
  statusCode: number
  message: string
  success: false
}

export type PaginatedResult<T> = {
  total: number
  page: number
  limit: number
  totalPages: number
  items?: T[]
}

export type AuthUser = {
  id: number
  name: string
  email: string
  avatar?: string | null
  createdAt?: string
  isTwoFactorEnabled?: boolean
}

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type AuthPayload = AuthTokens & {
  user: AuthUser
}

export type TwoFactorChallenge = {
  is2FARequired: true
  userId: number
}

export type Workspace = {
  id: number
  name: string
  ownerId?: number
  _count?: {
    members?: number
    projects?: number
  }
}

export type WorkspaceMember = {
  id: number
  userId: number
  workspaceId: number
  roleId?: number
  role?: {
    id: number
    name: string
    description?: string | null
  }
  user?: {
    id: number
    name: string
    email: string
    avatar?: string | null
  }
}

export type Tag = {
  id: number
  name: string
  color?: string | null
  workspaceId?: number
}

export type Project = {
  id: number
  name: string
  workspaceId: number
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE"

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"

export type Task = {
  id: number
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  projectId: number
  workspaceId: number
  assignedToId?: number | null
  dueDate?: string | null
  position?: number
  tags?: Tag[]
  attachments?: AttachmentItem[]
  attachmentCount?: number
}

export type AttachmentItem = {
  id: number
  taskId?: number
  file?: string
  fileUrl?: string
  filename?: string
  originalName?: string
  mimeType?: string
  createdAt?: string
}

export type CommentItem = {
  id: number
  taskId: number
  content: string
  createdAt: string
  parentCommentId?: number | null
  replyCount?: number
  replies?: CommentItem[]
  user?: {
    id: number
    name: string
    email?: string
    avatar?: string | null
  }
}

export type NotificationItem = {
  id: number
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export type TwoFactorSetupPayload = {
  secret: string
  qrCodeUrl: string
}
