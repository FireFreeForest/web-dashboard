import { toast } from "sonner"

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
import { useUpdateUser } from "@/features/users/mutations"
import type { User } from "@/features/users/types"
import { ApiError } from "@/lib/api/types"

export function DeactivateUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const updateUser = useUpdateUser()

  const handleConfirm = async () => {
    if (!user) {
      return
    }

    try {
      await updateUser.mutateAsync({ id: user.id, is_active: false })
      toast.success("User dinonaktifkan.")
      onOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "not_found") {
          toast.error("User tidak ditemukan. Daftar akan diperbarui.")
          onOpenChange(false)
          return
        }
        toast.error(
          error.code === "forbidden"
            ? "Anda tidak memiliki akses untuk menonaktifkan user."
            : error.message
        )
        return
      }
      toast.error("Terjadi kesalahan tidak terduga.")
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Nonaktifkan user?</AlertDialogTitle>
          <AlertDialogDescription>
            {user
              ? `${user.name || user.email} tidak akan bisa login lagi.`
              : ""}{" "}
            Sesi lama tetap aktif sampai access token kedaluwarsa. Gunakan edit
            user untuk mengaktifkan kembali.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateUser.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={updateUser.isPending}
          >
            {updateUser.isPending ? "Processing..." : "Deactivate"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
