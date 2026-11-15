import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  PencilEdit01Icon,
  RadioTowerIcon,
} from "@hugeicons/core-free-icons"

import { UpdateDeviceForm } from "@/components/devices/update-device-form"
import {
  DeviceStatusPill,
  formatDateTime,
} from "@/components/devices/device-ui"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useDevice } from "@/features/devices/queries"
import { useDeleteDevice } from "@/features/devices/mutations"
import type { Device } from "@/features/devices/types"
import { ApiError } from "@/lib/api/types"

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

function DeviceDetailContent({ device }: { device: Device }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <HugeiconsIcon
            icon={RadioTowerIcon}
            strokeWidth={2}
            className="size-5 text-muted-foreground"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate font-heading text-base font-semibold">
            {device.name}
          </p>
          <span className="truncate font-mono text-xs tracking-wide text-muted-foreground">
            {device.device_id}
          </span>
        </div>
        <DeviceStatusPill status={device.status} />
      </div>

      <div className="flex flex-col gap-3">
        <DetailRow label="Lokasi" value={device.location_name || "—"} />
        <DetailRow
          label="Latitude"
          value={device.latitude != null ? String(device.latitude) : "—"}
        />
        <DetailRow
          label="Longitude"
          value={device.longitude != null ? String(device.longitude) : "—"}
        />
        <DetailRow label="Firmware" value={device.firmware_version || "—"} />
        <DetailRow
          label="Last seen"
          value={formatDateTime(device.last_seen_at)}
        />
        <DetailRow label="Dibuat" value={formatDateTime(device.created_at)} />
        <DetailRow
          label="Diperbarui"
          value={formatDateTime(device.updated_at)}
        />
      </div>
    </div>
  )
}

function DeleteDeviceDialog({
  device,
  onDeleted,
}: {
  device: Device
  onDeleted: () => void
}) {
  const deleteDevice = useDeleteDevice()
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDelete = async () => {
    setErrorMessage(null)

    try {
      await deleteDevice.mutateAsync(device.device_id)
      onDeleted()
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "Terjadi kesalahan."
      )
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="destructive" className="flex-1" />}
      >
        <HugeiconsIcon
          icon={Delete02Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Hapus
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Device?</AlertDialogTitle>
          <AlertDialogDescription>
            Device "{device.name}" akan dihapus permanen. Tindakan ini tidak
            dapat dibatalkan.
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
            disabled={deleteDevice.isPending}
          >
            {deleteDevice.isPending ? "Menghapus..." : "Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function DeviceDetailPanel({
  deviceId,
  editing,
  canEdit,
  onEdit,
  onCancelEdit,
  onSaved,
  onDeleted,
}: {
  deviceId: string
  editing: boolean
  canEdit: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSaved: () => void
  onDeleted: () => void
}) {
  const {
    data: device,
    isPending,
    isError,
    error,
    refetch,
  } = useDevice(deviceId)

  if (isPending) {
    return (
      <div className="flex flex-col gap-3 px-6 pb-6">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  if (isError || !device) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 pb-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={RadioTowerIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Gagal memuat detail</EmptyTitle>
            <EmptyDescription>{error?.message}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  if (editing) {
    return (
      <UpdateDeviceForm
        device={device}
        onCancel={onCancelEdit}
        onSuccess={onSaved}
      />
    )
  }

  return (
    <>
      <DeviceDetailContent device={device} />
      {canEdit ? (
        <SheetFooter className="flex-row">
          <Button onClick={onEdit} className="flex-1">
            <HugeiconsIcon
              icon={PencilEdit01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Edit
          </Button>
          <DeleteDeviceDialog device={device} onDeleted={onDeleted} />
        </SheetFooter>
      ) : null}
    </>
  )
}

export function DeviceDetailSheet({
  deviceId,
  open,
  onOpenChange,
  canEdit,
}: {
  deviceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canEdit: boolean
}) {
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!open) {
      setEditing(false)
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editing ? "Edit Device" : "Detail Device"}</SheetTitle>
          <SheetDescription>
            {editing
              ? "Perbarui informasi perangkat."
              : "Informasi lengkap perangkat."}
          </SheetDescription>
        </SheetHeader>
        {deviceId ? (
          <DeviceDetailPanel
            deviceId={deviceId}
            editing={editing}
            canEdit={canEdit}
            onEdit={() => setEditing(true)}
            onCancelEdit={() => setEditing(false)}
            onSaved={() => setEditing(false)}
            onDeleted={() => onOpenChange(false)}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
