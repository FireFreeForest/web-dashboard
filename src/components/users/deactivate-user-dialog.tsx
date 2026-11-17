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
            ? "Anda tidak memiliki akses untuk menonaktifkan User."
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
          <AlertDialogTitle>Nonaktifkan User?</AlertDialogTitle>
          <AlertDialogDescription>
            {user
              ? `${user.name || user.email} tidak akan bisa masuk lagi.`
              : ""}{" "}
            Sesi lama tetap aktif sampai token akses kedaluwarsa. Gunakan ubah
            User untuk mengaktifkan kembali.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={updateUser.isPending}>
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleConfirm}
            disabled={updateUser.isPending}
          >
            {updateUser.isPending ? "Memproses..." : "Nonaktifkan"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
