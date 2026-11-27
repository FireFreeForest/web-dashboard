import { useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Edit02Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDeleteAssistantThread,
  useRenameAssistantThread,
} from "@/features/assistant/mutations"
import { assistantErrorMessage } from "@/features/assistant/errors"
import { useAssistantThreads } from "@/features/assistant/queries"
import type { AssistantThread } from "@/features/assistant/types"
import { cn } from "@/lib/utils"

function threadTitle(thread: AssistantThread): string {
  return thread.title?.trim() || "Percakapan baru"
}

export function AssistantThreadSidebar({
  activeThreadId,
  onSelectThread,
  onActiveThreadDeleted,
}: {
  activeThreadId?: string
  onSelectThread: (threadId: string) => void
  onActiveThreadDeleted?: () => void
}) {
  const threadsQuery = useAssistantThreads()
  const renameThread = useRenameAssistantThread()
  const deleteThread = useDeleteAssistantThread()

  const [renameTarget, setRenameTarget] = useState<AssistantThread | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<AssistantThread | null>(null)

  const threads = threadsQuery.data?.threads ?? []

  const openRename = (thread: AssistantThread) => {
    setRenameTarget(thread)
    setRenameValue(thread.title ?? "")
  }

  const submitRename = async () => {
    if (!renameTarget || !renameValue.trim()) {
      return
    }

    try {
      await renameThread.mutateAsync({
        threadId: renameTarget.id,
        title: renameValue.trim(),
      })
      setRenameTarget(null)
    } catch (error) {
      toast.error(assistantErrorMessage(error))
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return
    }

    const deletedId = deleteTarget.id

    try {
      await deleteThread.mutateAsync(deletedId)
      setDeleteTarget(null)

      if (deletedId === activeThreadId) {
        onActiveThreadDeleted?.()
      }
    } catch (error) {
      toast.error(assistantErrorMessage(error))
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1">
      <span className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        Riwayat
      </span>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-0.5">
          {threadsQuery.isLoading ? (
            <div className="flex flex-col gap-1 py-1">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : threadsQuery.isError ? (
            <div className="flex flex-col gap-2 px-2 py-3 text-sm text-muted-foreground">
              <span>Gagal memuat riwayat.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void threadsQuery.refetch()}
              >
                Coba lagi
              </Button>
            </div>
          ) : threads.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              Belum ada percakapan.
            </p>
          ) : (
            threads.map((thread) => {
              const active = thread.id === activeThreadId

              return (
                <div key={thread.id} className="group/thread relative">
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-2 pr-8 text-left font-normal",
                      active && "bg-muted font-medium hover:bg-muted"
                    )}
                    aria-current={active ? "true" : undefined}
                    onClick={() => onSelectThread(thread.id)}
                  >
                    <span className="truncate">{threadTitle(thread)}</span>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label="Aksi percakapan"
                          className="pointer-events-none absolute end-1 top-1/2 -translate-y-1/2 rounded-lg opacity-0 group-hover/thread:pointer-events-auto group-hover/thread:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 data-[popup-open]:pointer-events-auto data-[popup-open]:opacity-100"
                        />
                      }
                    >
                      <HugeiconsIcon
                        icon={MoreHorizontalIcon}
                        strokeWidth={2}
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="bottom">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => openRename(thread)}>
                          <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                          Ganti nama
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleteTarget(thread)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      <Dialog
        open={Boolean(renameTarget)}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti nama percakapan</DialogTitle>
            <DialogDescription>
              Masukkan nama baru untuk percakapan ini.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            placeholder="Nama percakapan"
            autoFocus
          />
          <DialogFooter showCloseButton>
            <Button
              type="button"
              disabled={!renameValue.trim() || renameThread.isPending}
              onClick={() => void submitRename()}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus percakapan?</AlertDialogTitle>
            <AlertDialogDescription>
              Percakapan{" "}
              <span className="font-medium text-foreground">
                {deleteTarget ? threadTitle(deleteTarget) : ""}
              </span>{" "}
              akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteThread.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteThread.isPending}
              onClick={() => void confirmDelete()}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
