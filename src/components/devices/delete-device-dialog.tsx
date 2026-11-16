import { useState } from "react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDeleteDevice } from "@/features/devices/mutations"
import type { Device } from "@/features/devices/types"
import { ApiError } from "@/lib/api/types"

export function DeleteDeviceDialog({
  device,
  open,
  onOpenChange,
}: {
  device: Device | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const deleteDevice = useDeleteDevice()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    setErrorMessage(null)
    onOpenChange(nextOpen)
  }

  const handleDelete = async () => {
    if (!device) return

    setErrorMessage(null)

    try {
      await deleteDevice.mutateAsync(device.device_id)
      toast.success("Device berhasil dihapus.")
      handleOpenChange(false)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Terjadi kesalahan."
      )
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Device?</AlertDialogTitle>
          <AlertDialogDescription>
            {device
              ? `Device "${device.name}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!device || deleteDevice.isPending}
          >
            {deleteDevice.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
