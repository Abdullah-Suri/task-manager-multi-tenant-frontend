"use client"

import * as React from "react"

import {
  type CollisionDetection,
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { format, formatDistanceToNowStrict, isPast, isToday, parseISO } from "date-fns"
import {
  AlertCircle,
  Check,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Download,
  MessageSquare,
  Palette,
  Flag,
  GripVertical,
  Paperclip,
  Plus,
  TimerReset,
} from "lucide-react"
import { toast } from "sonner"

import { useTaskAttachmentsQuery } from "@/features/attachments/hooks"
import {
  useCreateCommentMutation,
  useTaskCommentsQuery,
} from "@/features/comments/hooks"
import { useMembersQuery } from "@/features/members/hooks"
import {
  useCreateTaskMutation,
  useTaskDetailQuery,
  useReorderTaskMutation,
  useUpdateTaskMutation,
} from "@/features/tasks/hooks"
import {
  useAssignTagMutation,
  useCreateTagMutation,
  useRemoveTagMutation,
  useTagsQuery,
} from "@/features/tags/hooks"
import { env } from "@/lib/config/env"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import type {
  AttachmentItem,
  CommentItem,
  Project,
  Tag,
  Task,
  TaskPriority,
  TaskStatus,
  Workspace,
  WorkspaceMember,
} from "@/types/api"

const statusOrder: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

const statusConfig: Record<
  TaskStatus,
  {
    label: string
    helper: string
    icon: React.ComponentType<{ className?: string }>
    tone: string
    panel: string
  }
> = {
  TODO: {
    label: "Planned",
    helper: "Ideas and next actions waiting to start.",
    icon: CircleDashed,
    tone: "text-slate-600 dark:text-slate-300",
    panel: "bg-slate-50 dark:bg-slate-900/40",
  },
  IN_PROGRESS: {
    label: "In progress",
    helper: "Active work currently moving forward.",
    icon: TimerReset,
    tone: "text-amber-600 dark:text-amber-300",
    panel: "bg-amber-50 dark:bg-amber-950/30",
  },
  DONE: {
    label: "Completed",
    helper: "Finished work ready to review or archive.",
    icon: CheckCircle2,
    tone: "text-emerald-600 dark:text-emerald-300",
    panel: "bg-emerald-50 dark:bg-emerald-950/30",
  },
}

const priorityTone: Record<TaskPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  MEDIUM: "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-200",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200",
  URGENT: "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200",
}

const tagPalette = [
  { value: "#2563eb", label: "Blue" },
  { value: "#059669", label: "Green" },
  { value: "#d97706", label: "Amber" },
  { value: "#dc2626", label: "Red" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#db2777", label: "Pink" },
  { value: "#0f766e", label: "Teal" },
  { value: "#4f46e5", label: "Indigo" },
] as const

type TaskFormState = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  assignedToId: string
  position: string
  files: File[]
}

type TagDraft = {
  name: string
  color: string
}

const initialTaskForm = (): TaskFormState => ({
  title: "",
  description: "",
  status: "TODO",
  priority: "MEDIUM",
  dueDate: undefined,
  assignedToId: "",
  position: "",
  files: [],
})

const initialTagDraft = (): TagDraft => ({
  name: "",
  color: "#2563eb",
})

const createTaskId = (taskId: number) => `task:${taskId}`
const createColumnId = (status: TaskStatus) => `column:${status}`

function isTaskId(value: string) {
  return value.startsWith("task:")
}

function isColumnId(value: string) {
  return value.startsWith("column:")
}

function parseTaskId(value: string) {
  return Number(value.replace("task:", ""))
}

function parseColumnStatus(value: string): TaskStatus {
  return value.replace("column:", "") as TaskStatus
}

const boardCollisionDetection: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args)

  if (pointerHits.length > 0) {
    const taskHit = pointerHits.find((entry) => isTaskId(String(entry.id)))

    if (taskHit) {
      return [taskHit]
    }

    return pointerHits
  }

  const cornerHits = closestCorners(args)
  const taskHit = cornerHits.find((entry) => isTaskId(String(entry.id)))

  if (taskHit) {
    return [taskHit]
  }

  return cornerHits
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((left, right) => {
    const leftPosition = typeof left.position === "number" ? left.position : Number.MAX_SAFE_INTEGER
    const rightPosition = typeof right.position === "number" ? right.position : Number.MAX_SAFE_INTEGER

    if (leftPosition !== rightPosition) {
      return leftPosition - rightPosition
    }

    return left.id - right.id
  })
}

function formatDueDate(value?: string | null) {
  if (!value) {
    return null
  }

  const dueDate = parseISO(value)
  const relative = formatDistanceToNowStrict(dueDate, { addSuffix: true })

  if (isToday(dueDate)) {
    return `Due today - ${format(dueDate, "h:mm a")}`
  }

  return `${format(dueDate, "MMM d")} - ${relative}`
}

function toDueDateISOString(date?: Date) {
  if (!date) {
    return undefined
  }

  const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)

  return normalized.toISOString()
}

function createTaskFormFromTask(task: Task): TaskFormState {
  return {
    title: task.title,
    description: task.description ?? "",
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate ? parseISO(task.dueDate) : undefined,
    assignedToId: task.assignedToId ? String(task.assignedToId) : "",
    position: typeof task.position === "number" ? String(task.position) : "",
    files: [],
  }
}

function getPositionForIndex(tasks: Task[], index: number) {
  const previous = tasks[index - 1]
  const next = tasks[index]

  const previousPosition =
    typeof previous?.position === "number" ? previous.position : undefined
  const nextPosition = typeof next?.position === "number" ? next.position : undefined

  if (previousPosition !== undefined && nextPosition !== undefined) {
    return (previousPosition + nextPosition) / 2
  }

  if (previousPosition !== undefined) {
    return previousPosition + 1024
  }

  if (nextPosition !== undefined) {
    return nextPosition / 2
  }

  return 1024
}

function resolveWorkspaceId(task: Task, workspace: Workspace | null) {
  return workspace?.id ?? task.workspaceId
}

function resolveProjectId(task: Task, project: Project | null) {
  return project?.id ?? task.projectId
}

function getTagColor(tag: Tag) {
  if (tag.color && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(tag.color)) {
    return tag.color
  }

  const seed = `${tag.id}-${tag.name}`
  const code = [...seed].reduce((sum, character) => sum + character.charCodeAt(0), 0)
  return tagPalette[code % tagPalette.length].value
}

function withAlpha(hexColor: string, alphaHex: string) {
  return `${hexColor}${alphaHex}`
}

function getAttachmentUrl(attachment: AttachmentItem) {
  const rawPath = attachment.fileUrl ?? attachment.file ?? ""

  if (!rawPath) {
    return ""
  }

  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath
  }

  return `${env.apiOrigin}${rawPath.startsWith("/") ? rawPath : `/${rawPath}`}`
}

function getAttachmentName(attachment: AttachmentItem) {
  return attachment.originalName ?? attachment.filename ?? attachment.file ?? "Attachment"
}

export function ProjectBoard({
  workspace,
  project,
  tasks,
}: {
  workspace: Workspace | null
  project: Project | null
  tasks: Task[]
}) {
  const createTaskMutation = useCreateTaskMutation()
  const updateTaskMutation = useUpdateTaskMutation()
  const reorderTaskMutation = useReorderTaskMutation()
  const assignTagMutation = useAssignTagMutation()
  const createTagMutation = useCreateTagMutation()
  const removeTagMutation = useRemoveTagMutation()
  const createCommentMutation = useCreateCommentMutation()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const { data: members = [] } = useMembersQuery(workspace?.id ?? null)
  const { data: workspaceTags = [] } = useTagsQuery(workspace?.id ?? null)

  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [createForm, setCreateForm] = React.useState<TaskFormState>(initialTaskForm)
  const [createSelectedTagIds, setCreateSelectedTagIds] = React.useState<number[]>([])
  const [createTagDraft, setCreateTagDraft] = React.useState<TagDraft>(initialTagDraft)
  const [selectedTaskId, setSelectedTaskId] = React.useState<number | null>(null)
  const [detailForm, setDetailForm] = React.useState<TaskFormState>(initialTaskForm)
  const [detailSelectedTagIds, setDetailSelectedTagIds] = React.useState<number[]>([])
  const [detailTagDraft, setDetailTagDraft] = React.useState<TagDraft>(initialTagDraft)
  const [commentDraft, setCommentDraft] = React.useState("")
  const [activeDragTaskId, setActiveDragTaskId] = React.useState<number | null>(null)
  const [boardTasks, setBoardTasks] = React.useState<Task[]>(tasks)

  React.useEffect(() => {
    setBoardTasks(tasks)
  }, [tasks])

  const groupedTasks = React.useMemo<Record<TaskStatus, Task[]>>(
    () => ({
      TODO: sortTasks(boardTasks.filter((task) => task.status === "TODO")),
      IN_PROGRESS: sortTasks(boardTasks.filter((task) => task.status === "IN_PROGRESS")),
      DONE: sortTasks(boardTasks.filter((task) => task.status === "DONE")),
    }),
    [boardTasks]
  )

  const taskLookup = React.useMemo(
    () => new Map(boardTasks.map((task) => [task.id, task])),
    [boardTasks]
  )

  const selectedTask = selectedTaskId ? taskLookup.get(selectedTaskId) ?? null : null
  const activeDragTask = activeDragTaskId ? taskLookup.get(activeDragTaskId) ?? null : null
  const { data: taskDetail } = useTaskDetailQuery(workspace?.id ?? null, selectedTask?.id ?? null)
  const { data: commentData } = useTaskCommentsQuery(workspace?.id ?? null, selectedTask?.id ?? null)
  const { data: selectedTaskAttachments = [] } = useTaskAttachmentsQuery(
    workspace?.id ?? null,
    selectedTask?.id ?? null
  )

  React.useEffect(() => {
    if (selectedTask) {
      setDetailForm(createTaskFormFromTask(selectedTask))
      setDetailSelectedTagIds(selectedTask.tags?.map((tag) => tag.id) ?? [])
    }
  }, [selectedTask])

  const completedCount = groupedTasks.DONE.length
  const progress = boardTasks.length ? Math.round((completedCount / boardTasks.length) * 100) : 0
  const overdueCount = boardTasks.filter(
    (task) => task.dueDate && isPast(parseISO(task.dueDate)) && task.status !== "DONE"
  ).length
  const urgentCount = boardTasks.filter((task) => task.priority === "URGENT").length

  const mergeTaskIntoBoard = React.useCallback((nextTask: Task) => {
    setBoardTasks((current) => {
      const workspaceId = nextTask.workspaceId ?? workspace?.id ?? null
      const projectId = nextTask.projectId ?? project?.id ?? null

      return current.map((task) =>
        task.id === nextTask.id
          ? {
              ...task,
              ...nextTask,
              workspaceId: workspaceId ?? task.workspaceId,
              projectId: projectId ?? task.projectId,
            }
          : task
      )
    })
  }, [project?.id, workspace?.id])

  React.useEffect(() => {
    if (taskDetail) {
      mergeTaskIntoBoard(taskDetail)
    }
  }, [mergeTaskIntoBoard, taskDetail])

  const applyTaskPreview = React.useCallback(
    (taskId: number, patch: Partial<Task>) => {
      setBoardTasks((current) =>
        current.map((task) =>
          task.id === taskId
            ? {
                ...task,
                ...patch,
                workspaceId: patch.workspaceId ?? task.workspaceId ?? workspace?.id ?? 0,
                projectId: patch.projectId ?? task.projectId ?? project?.id ?? 0,
              }
            : task
        )
      )
    },
    [project?.id, workspace?.id]
  )

  const submitCreateTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!workspace?.id || !project?.id || !createForm.title.trim()) {
      return
    }

    try {
      const createdTask = await createTaskMutation.mutateAsync({
        workspaceId: workspace.id,
        projectId: project.id,
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        status: createForm.status,
        priority: createForm.priority,
        dueDate: toDueDateISOString(createForm.dueDate),
        assignedToId: createForm.assignedToId ? Number(createForm.assignedToId) : undefined,
        position: createForm.position ? Number(createForm.position) : undefined,
        files: createForm.files.length ? createForm.files : undefined,
      })

      if (createSelectedTagIds.length) {
        await Promise.all(
          createSelectedTagIds.map((tagId) =>
            assignTagMutation.mutateAsync({
              workspaceId: workspace.id,
              taskId: createdTask.id,
              tagId,
              projectId: project.id,
            })
          )
        )
      }

      setBoardTasks((current) => [
        {
          ...createdTask,
          workspaceId: createdTask.workspaceId ?? workspace.id,
          projectId: createdTask.projectId ?? project.id,
          tags: workspaceTags.filter((tag) => createSelectedTagIds.includes(tag.id)),
        },
        ...current.filter((task) => task.id !== createdTask.id),
      ])

      toast.success("Task created.")
      setCreateForm(initialTaskForm())
      setCreateSelectedTagIds([])
      setCreateTagDraft(initialTagDraft())
      setIsCreateOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create task.")
    }
  }

  const moveTask = async (task: Task, nextStatus: TaskStatus) => {
    const workspaceId = resolveWorkspaceId(task, workspace)
    const projectId = resolveProjectId(task, project)

    if (!workspaceId || !projectId) {
      toast.error("Task context is missing. Reload the board and try again.")
      return
    }

    const targetTasks = groupedTasks[nextStatus].filter((item) => item.id !== task.id)
    const nextPosition = getPositionForIndex(targetTasks, targetTasks.length)

    try {
      if (task.status !== nextStatus) {
        applyTaskPreview(task.id, { status: nextStatus, workspaceId, projectId })

        const updatedTask = await updateTaskMutation.mutateAsync({
          workspaceId,
          taskId: task.id,
          projectId,
          status: nextStatus,
        })

        mergeTaskIntoBoard(updatedTask)
      }

      applyTaskPreview(task.id, { status: nextStatus, position: nextPosition, workspaceId, projectId })

      const reorderedTask = await reorderTaskMutation.mutateAsync({
        workspaceId,
        taskId: task.id,
        position: nextPosition,
        projectId,
      })
      mergeTaskIntoBoard(reorderedTask)
      toast.success("Task updated.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update task.")
    }
  }

  const saveTaskDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedTask || !detailForm.title.trim()) {
      return
    }

    const workspaceId = resolveWorkspaceId(selectedTask, workspace)
    const projectId = resolveProjectId(selectedTask, project)

    if (!workspaceId || !projectId) {
      toast.error("Task context is missing. Reload the board and try again.")
      return
    }

    try {
      const previousTagIds = selectedTask.tags?.map((tag) => tag.id) ?? []
      const tagsToAdd = detailSelectedTagIds.filter((tagId) => !previousTagIds.includes(tagId))
      const tagsToRemove = previousTagIds.filter((tagId) => !detailSelectedTagIds.includes(tagId))

      applyTaskPreview(selectedTask.id, {
        title: detailForm.title.trim(),
        description: detailForm.description.trim() || undefined,
        status: detailForm.status,
        priority: detailForm.priority,
        dueDate: toDueDateISOString(detailForm.dueDate) ?? null,
        assignedToId: detailForm.assignedToId ? Number(detailForm.assignedToId) : null,
        workspaceId,
        projectId,
        tags: workspaceTags.filter((tag) => detailSelectedTagIds.includes(tag.id)),
      })

      const updatedTask = await updateTaskMutation.mutateAsync({
        workspaceId,
        taskId: selectedTask.id,
        projectId,
        title: detailForm.title.trim(),
        description: detailForm.description.trim() || undefined,
        status: detailForm.status,
        priority: detailForm.priority,
        dueDate: toDueDateISOString(detailForm.dueDate),
        assignedToId: detailForm.assignedToId ? Number(detailForm.assignedToId) : null,
      })
      mergeTaskIntoBoard(updatedTask)

      if (tagsToAdd.length) {
        await Promise.all(
          tagsToAdd.map((tagId) =>
            assignTagMutation.mutateAsync({
              workspaceId,
              taskId: selectedTask.id,
              tagId,
              projectId,
            })
          )
        )
      }

      if (tagsToRemove.length) {
        await Promise.all(
          tagsToRemove.map((tagId) =>
            removeTagMutation.mutateAsync({
              workspaceId,
              taskId: selectedTask.id,
              tagId,
              projectId,
            })
          )
        )
      }

      if (detailForm.position) {
        applyTaskPreview(selectedTask.id, {
          position: Number(detailForm.position),
          workspaceId,
          projectId,
        })

        const reorderedTask = await reorderTaskMutation.mutateAsync({
          workspaceId,
          taskId: selectedTask.id,
          position: Number(detailForm.position),
          projectId,
        })
        mergeTaskIntoBoard(reorderedTask)
      }

      toast.success("Task details saved.")
      setDetailTagDraft(initialTagDraft())
      setSelectedTaskId(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save task.")
    }
  }

  const handleDialogChange = (open: boolean) => {
    setIsCreateOpen(open)
    if (!open) {
      setCreateForm(initialTaskForm())
      setCreateSelectedTagIds([])
      setCreateTagDraft(initialTagDraft())
    }
  }

  const createInlineTag = async ({
    draft,
    selectTag,
    resetDraft,
  }: {
    draft: TagDraft
    selectTag: (tagId: number) => void
    resetDraft: () => void
  }) => {
    if (!workspace?.id || !draft.name.trim()) {
      return
    }

    try {
      const tag = await createTagMutation.mutateAsync({
        workspaceId: workspace.id,
        name: draft.name.trim(),
        color: draft.color,
      })
      selectTag(tag.id)
      resetDraft()
      toast.success("Label created.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create label.")
    }
  }

  const submitComment = async () => {
    if (!selectedTask || !workspace?.id || !commentDraft.trim()) {
      return
    }

    try {
      await createCommentMutation.mutateAsync({
        workspaceId: workspace.id,
        taskId: selectedTask.id,
        content: commentDraft.trim(),
      })
      setCommentDraft("")
      toast.success("Comment added.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add comment.")
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const activeId = String(event.active.id)

    if (!isTaskId(activeId)) {
      return
    }

    setActiveDragTaskId(parseTaskId(activeId))
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragTaskId(null)

    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null

    if (!overId || !isTaskId(activeId)) {
      return
    }

    const task = taskLookup.get(parseTaskId(activeId))

    if (!task) {
      return
    }

    const workspaceId = resolveWorkspaceId(task, workspace)
    const projectId = resolveProjectId(task, project)

    if (!workspaceId || !projectId) {
      toast.error("Task context is missing. Reload the board and try again.")
      return
    }

    const targetStatus = isColumnId(overId)
      ? parseColumnStatus(overId)
      : taskLookup.get(parseTaskId(overId))?.status

    if (!targetStatus) {
      return
    }

    const laneTasks = groupedTasks[targetStatus].filter((item) => item.id !== task.id)
    const targetIndex = isTaskId(overId)
      ? Math.max(
          laneTasks.findIndex((item) => item.id === parseTaskId(overId)),
          0
        )
      : laneTasks.length
    const nextPosition = getPositionForIndex(laneTasks, targetIndex)

    try {
      if (task.status !== targetStatus) {
        applyTaskPreview(task.id, { status: targetStatus, workspaceId, projectId })

        const updatedTask = await updateTaskMutation.mutateAsync({
          workspaceId,
          taskId: task.id,
          projectId,
          status: targetStatus,
        })
        mergeTaskIntoBoard(updatedTask)
      }

      applyTaskPreview(task.id, { status: targetStatus, position: nextPosition, workspaceId, projectId })

      const reorderedTask = await reorderTaskMutation.mutateAsync({
        workspaceId,
        taskId: task.id,
        position: nextPosition,
        projectId,
      })
      mergeTaskIntoBoard(reorderedTask)
      toast.success("Task moved.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not move task.")
    }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-background shadow-sm">
        <div className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(245,248,255,0.95),rgba(248,243,234,0.9))] px-6 py-8 dark:bg-[linear-gradient(135deg,rgba(28,35,52,0.95),rgba(34,27,39,0.92))]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                {workspace?.name ?? "Workspace"}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                {project?.name ?? "Select a project"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Keep work moving with a clean board for planning, execution, and delivery.
              </p>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={handleDialogChange}>
              <DialogTrigger asChild>
                <Button disabled={!project}>
                  <Plus className="size-4" />
                  Create task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden p-0">
                <form onSubmit={submitCreateTask}>
                  <DialogHeader className="px-6 pt-6">
                    <DialogTitle>Add a new task</DialogTitle>
                    <DialogDescription>
                      Capture the details once, then manage progress from the board.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid max-h-[calc(90vh-10rem)] gap-5 overflow-y-auto px-6 py-5">
                    <TaskFormFields
                      form={createForm}
                      setForm={setCreateForm}
                      members={members}
                      tags={workspaceTags}
                      selectedTagIds={createSelectedTagIds}
                      tagDraft={createTagDraft}
                      setTagDraft={setCreateTagDraft}
                      onCreateTag={() =>
                        createInlineTag({
                          draft: createTagDraft,
                          selectTag: (tagId) =>
                            setCreateSelectedTagIds((current) =>
                              current.includes(tagId) ? current : [...current, tagId]
                            ),
                          resetDraft: () => setCreateTagDraft(initialTagDraft()),
                        })
                      }
                      isCreatingTag={createTagMutation.isPending}
                      onToggleTag={(tagId) =>
                        setCreateSelectedTagIds((current) =>
                          current.includes(tagId)
                            ? current.filter((item) => item !== tagId)
                            : [...current, tagId]
                        )
                      }
                    />
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={
                        createTaskMutation.isPending || !workspace || !project || !createForm.title.trim()
                      }
                    >
                      {createTaskMutation.isPending ? "Creating..." : "Create task"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 md:grid-cols-4">
          <MetricCard label="Total tasks" value={String(boardTasks.length)} hint="All items on this board" />
          <MetricCard label="Completion" value={`${progress}%`} hint={`${completedCount} completed`} />
          <MetricCard label="Urgent items" value={String(urgentCount)} hint="Need attention first" />
          <MetricCard label="Overdue" value={String(overdueCount)} hint="Past due and still open" />
        </div>
      </section>

      {!project ? (
        <section className="rounded-[2rem] border border-dashed border-border bg-card px-6 py-14 text-center text-sm text-muted-foreground shadow-sm">
          Pick a project to open its board and start planning work.
        </section>
      ) : null}

      {project ? (
        <DndContext
          sensors={sensors}
          collisionDetection={boardCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <section className="grid gap-4 xl:grid-cols-3">
            {statusOrder.map((status) => {
              const column = statusConfig[status]
              const Icon = column.icon

              return (
                <BoardColumn
                  key={status}
                  status={status}
                  label={column.label}
                  helper={column.helper}
                  tone={column.tone}
                  panel={column.panel}
                  icon={<Icon className="size-4.5" />}
                  tasks={groupedTasks[status]}
                  onOpenTask={setSelectedTaskId}
                  onMoveTask={moveTask}
                />
              )
            })}
          </section>

          <DragOverlay>
            {activeDragTask ? (
              <TaskCard task={activeDragTask} onOpen={() => {}} onMove={moveTask} dragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : null}

      <Sheet open={Boolean(selectedTask)} onOpenChange={(open) => !open && setSelectedTaskId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {selectedTask ? (
            <form onSubmit={saveTaskDetails} className="flex h-full flex-col">
              <SheetHeader className="border-b border-border/60">
                <SheetTitle>{selectedTask.title}</SheetTitle>
                <SheetDescription>
                  Review the task details and update progress without leaving the board.
                </SheetDescription>
              </SheetHeader>

              <div className="grid gap-5 p-4">
                <TaskFormFields
                  form={detailForm}
                  setForm={setDetailForm}
                  members={members}
                  tags={workspaceTags}
                  selectedTagIds={detailSelectedTagIds}
                  tagDraft={detailTagDraft}
                  setTagDraft={setDetailTagDraft}
                  onCreateTag={() =>
                    createInlineTag({
                      draft: detailTagDraft,
                      selectTag: (tagId) =>
                        setDetailSelectedTagIds((current) =>
                          current.includes(tagId) ? current : [...current, tagId]
                        ),
                      resetDraft: () => setDetailTagDraft(initialTagDraft()),
                    })
                  }
                  isCreatingTag={createTagMutation.isPending}
                  onToggleTag={(tagId) =>
                    setDetailSelectedTagIds((current) =>
                      current.includes(tagId)
                        ? current.filter((item) => item !== tagId)
                        : [...current, tagId]
                    )
                  }
                />

                <section className="rounded-[1.5rem] border border-border/60 bg-card p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="size-4 text-muted-foreground" />
                    <h3 className="font-medium">Conversation</h3>
                  </div>

                  <div className="mt-4 space-y-3">
                    <Textarea
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      placeholder="Add an update for your team."
                      rows={3}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={submitComment}
                        disabled={createCommentMutation.isPending || !commentDraft.trim()}
                      >
                        {createCommentMutation.isPending ? "Posting..." : "Post comment"}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {commentData?.comments?.length ? (
                      commentData.comments.map((comment) => (
                        <CommentCard key={comment.id} comment={comment} />
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
                        No comments yet.
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-[1.5rem] border border-border/60 bg-card p-4">
                  <div className="flex items-center gap-2">
                    <Paperclip className="size-4 text-muted-foreground" />
                    <h3 className="font-medium">Attachments</h3>
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedTaskAttachments.length ? (
                      selectedTaskAttachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={getAttachmentUrl(attachment)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 transition-colors hover:bg-muted/40"
                        >
                          <div>
                            <p className="text-sm font-medium">{getAttachmentName(attachment)}</p>
                            {attachment.mimeType ? (
                              <p className="mt-1 text-xs text-muted-foreground">{attachment.mimeType}</p>
                            ) : null}
                          </div>
                          <Download className="size-4 text-muted-foreground" />
                        </a>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
                        No attachments yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              <SheetFooter className="border-t border-border/60">
                <Button type="button" variant="outline" onClick={() => setSelectedTaskId(null)}>
                  Close
                </Button>
                <Button
                  type="submit"
                  disabled={updateTaskMutation.isPending || reorderTaskMutation.isPending || !detailForm.title.trim()}
                >
                  {updateTaskMutation.isPending || reorderTaskMutation.isPending
                    ? "Saving..."
                    : "Save changes"}
                </Button>
              </SheetFooter>
            </form>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function TaskFormFields({
  form,
  setForm,
  members,
  tags,
  selectedTagIds,
  tagDraft,
  setTagDraft,
  onCreateTag,
  isCreatingTag,
  onToggleTag,
}: {
  form: TaskFormState
  setForm: React.Dispatch<React.SetStateAction<TaskFormState>>
  members: WorkspaceMember[]
  tags: Tag[]
  selectedTagIds: number[]
  tagDraft: TagDraft
  setTagDraft: React.Dispatch<React.SetStateAction<TagDraft>>
  onCreateTag: () => void
  isCreatingTag: boolean
  onToggleTag: (tagId: number) => void
}) {
  return (
    <>
      <Field label="Title" required>
        <Input
          value={form.title}
          onChange={(event) =>
            setForm((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Prepare launch checklist"
          maxLength={160}
        />
      </Field>

      <Field label="Description">
        <Textarea
          value={form.description}
          onChange={(event) =>
            setForm((current) => ({ ...current, description: event.target.value }))
          }
          placeholder="Add context, outcomes, and any details the team should know."
          rows={5}
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Stage">
          <Select
            value={form.status}
            onValueChange={(value: TaskStatus) =>
              setForm((current) => ({ ...current, status: value }))
            }
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Choose a stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODO">Planned</SelectItem>
              <SelectItem value="IN_PROGRESS">In progress</SelectItem>
              <SelectItem value="DONE">Completed</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Priority">
          <Select
            value={form.priority}
            onValueChange={(value: TaskPriority) =>
              setForm((current) => ({ ...current, priority: value }))
            }
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Choose priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Due date">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-10 w-full justify-start text-left font-normal",
                  !form.dueDate && "text-muted-foreground"
                )}
              >
                <CalendarDays className="size-4" />
                {form.dueDate ? format(form.dueDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.dueDate}
                onSelect={(date) =>
                  setForm((current) => ({ ...current, dueDate: date ?? undefined }))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </Field>

        <Field label="Assignee ID">
          <Select
            value={form.assignedToId || "unassigned"}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                assignedToId: value === "unassigned" ? "" : value,
              }))
            }
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="Choose an owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {members.map((member) => {
                const userId = member.user?.id ?? member.userId
                const label = member.user?.name ?? member.user?.email ?? `Member ${userId}`

                return (
                  <SelectItem key={userId} value={String(userId)}>
                    {label}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Board position">
          <Input
            type="number"
            min="0"
            step="0.1"
            value={form.position}
            onChange={(event) =>
              setForm((current) => ({ ...current, position: event.target.value }))
            }
            placeholder="Optional"
          />
        </Field>

        <Field label="Attachments">
          <Input
            type="file"
            multiple
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                files: Array.from(event.target.files ?? []),
              }))
            }
          />
          {form.files.length ? (
            <p className="text-xs text-muted-foreground">
              {form.files.length} file{form.files.length > 1 ? "s" : ""} selected
            </p>
          ) : null}
        </Field>
      </div>

      <Field label="Tags">
        <div className="flex flex-wrap gap-2">
          {tags.length ? (
            tags.map((tag) => {
              const isActive = selectedTagIds.includes(tag.id)

              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onToggleTag(tag.id)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "border-transparent text-white shadow-sm"
                      : "border-border bg-background text-foreground"
                  )}
                  style={{
                    backgroundColor: isActive ? getTagColor(tag) : undefined,
                  }}
                >
                  {tag.name}
                </button>
              )
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 px-4 py-4 text-sm text-muted-foreground">
              No labels available in this workspace yet.
            </div>
          )}
        </div>

        <div className="mt-3 rounded-2xl border border-dashed border-border/70 p-3">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <Input
              value={tagDraft.name}
              onChange={(event) =>
                setTagDraft((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Create a new label"
              maxLength={40}
            />
            <Button
              type="button"
              variant="outline"
              onClick={onCreateTag}
              disabled={isCreatingTag || !tagDraft.name.trim()}
            >
              {isCreatingTag ? "Creating..." : "Create label"}
            </Button>
          </div>

          <div className="mt-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Palette className="size-3.5" />
              Accent
            </div>
            <div className="flex flex-wrap gap-2">
              {tagPalette.map((option) => {
                const isActive = tagDraft.color === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-label={option.label}
                    onClick={() =>
                      setTagDraft((current) => ({ ...current, color: option.value }))
                    }
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full border transition-transform hover:scale-105",
                      isActive ? "border-foreground shadow-sm" : "border-border/70"
                    )}
                    style={{ backgroundColor: option.value }}
                  >
                    {isActive ? <Check className="size-4 text-white" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Field>
    </>
  )
}

function CommentCard({ comment }: { comment: CommentItem }) {
  return (
    <article className="rounded-2xl border border-border/60 bg-background px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          {comment.user?.name ?? comment.user?.email ?? "Team member"}
        </p>
        <p className="text-xs text-muted-foreground">
          {comment.createdAt ? format(parseISO(comment.createdAt), "MMM d, h:mm a") : ""}
        </p>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{comment.content}</p>
    </article>
  )
}

function BoardColumn({
  status,
  label,
  helper,
  tone,
  panel,
  icon,
  tasks,
  onOpenTask,
  onMoveTask,
}: {
  status: TaskStatus
  label: string
  helper: string
  tone: string
  panel: string
  icon: React.ReactNode
  tasks: Task[]
  onOpenTask: (taskId: number) => void
  onMoveTask: (task: Task, status: TaskStatus) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: createColumnId(status),
  })

  return (
    <div className={`rounded-[2rem] border border-border/60 ${panel} p-4 shadow-sm`}>
      <div className="mb-4 flex items-start justify-between gap-3 px-1">
        <div className="flex items-start gap-3">
          <div className={`flex size-10 items-center justify-center rounded-2xl bg-background ${tone}`}>
            {icon}
          </div>
          <div>
            <h2 className="font-semibold">{label}</h2>
            <p className="text-xs text-muted-foreground">{helper}</p>
          </div>
        </div>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "min-h-40 space-y-3 rounded-[1.5rem] transition-colors",
          isOver && "bg-background/60 p-2"
        )}
      >
        <SortableContext items={tasks.map((task) => createTaskId(task.id))} strategy={verticalListSortingStrategy}>
          {tasks.length ? (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onOpen={() => onOpenTask(task.id)}
                onMove={onMoveTask}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border/70 bg-background/70 px-4 py-8 text-center text-sm text-muted-foreground">
              No tasks in this stage yet.
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}

function SortableTaskCard({
  task,
  onOpen,
  onMove,
}: {
  task: Task
  onOpen: () => void
  onMove: (task: Task, status: TaskStatus) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: createTaskId(task.id),
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(isDragging && "opacity-40")}
    >
      <TaskCard
        task={task}
        onOpen={onOpen}
        onMove={onMove}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

function Field({
  label,
  children,
  required = false,
}: {
  label: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium text-foreground">
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </span>
      {children}
    </label>
  )
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <article className="rounded-2xl border border-border/60 bg-card px-4 py-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </article>
  )
}

function TaskCard({
  task,
  onOpen,
  onMove,
  dragHandleProps,
  dragging = false,
}: {
  task: Task
  onOpen: () => void
  onMove: (task: Task, status: TaskStatus) => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  dragging?: boolean
}) {
  const dueDateLabel = formatDueDate(task.dueDate)
  const isLate =
    Boolean(task.dueDate) && isPast(parseISO(task.dueDate as string)) && task.status !== "DONE"

  const nextActions =
    task.status === "TODO"
      ? [{ label: "Start work", status: "IN_PROGRESS" as TaskStatus }]
      : task.status === "IN_PROGRESS"
        ? [
            { label: "Move back", status: "TODO" as TaskStatus },
            { label: "Complete", status: "DONE" as TaskStatus },
          ]
        : [{ label: "Reopen", status: "IN_PROGRESS" as TaskStatus }]

  return (
    <article
      className={cn(
        "rounded-[1.6rem] border border-border/60 bg-background px-4 py-4 shadow-[0_1px_0_rgba(15,23,42,0.03)]",
        dragging && "rotate-1 shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <button type="button" className="text-left" onClick={onOpen}>
            <h3 className="text-sm font-semibold leading-6 transition-colors hover:text-foreground/80">
              {task.title}
            </h3>
          </button>
          {task.description ? (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {task.description}
            </p>
          ) : null}
        </div>
        <div className="flex items-start gap-2">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityTone[task.priority]}`}>
            {task.priority.replace("_", " ")}
          </span>
          {dragHandleProps ? (
            <button
              type="button"
              aria-label="Drag task"
              className="rounded-xl border border-border/60 bg-muted/40 p-2 text-muted-foreground transition-colors hover:bg-muted"
              onClick={(event) => event.stopPropagation()}
              {...dragHandleProps}
            >
              <GripVertical className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
          <Flag className="size-3.5" />
          #{task.id}
        </span>
        {typeof task.position === "number" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            Position {task.position}
          </span>
        ) : null}
        {dueDateLabel ? (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${
              isLate
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200"
                : "bg-muted"
            }`}
          >
            {isLate ? <AlertCircle className="size-3.5" /> : <CalendarDays className="size-3.5" />}
            {dueDateLabel}
          </span>
        ) : null}
        {task.assignedToId ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
            Owner #{task.assignedToId}
          </span>
        ) : null}
        {task.tags?.length
          ? task.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center rounded-full border px-2.5 py-1 font-medium"
                style={{
                  borderColor: withAlpha(getTagColor(tag), "55"),
                  backgroundColor: withAlpha(getTagColor(tag), "18"),
                  color: getTagColor(tag),
                }}
              >
                {tag.name}
              </span>
            ))
          : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {nextActions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant="outline"
              onClick={() => onMove(task, action.status)}
            >
              {action.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={onOpen}>
            View details
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Paperclip className="size-3.5" />
          <span>
            {task.attachments?.length ?? task.attachmentCount ?? 0} file
            {(task.attachments?.length ?? task.attachmentCount ?? 0) === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </article>
  )
}
