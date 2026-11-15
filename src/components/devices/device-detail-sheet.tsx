import { HugeiconsIcon } from "@hugeicons/react"
import { RadioTowerIcon } from "@hugeicons/core-free-icons"

import {
  DeviceStatusPill,
  formatDateTime,
} from "@/components/devices/device-ui"
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
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useDevice } from "@/features/devices/queries"
import type { Device } from "@/features/devices/types"

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

function DeviceDetail({ deviceId }: { deviceId: string }) {
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

  return <DeviceDetailContent device={device} />
}

export function DeviceDetailSheet({
  deviceId,
  open,
  onOpenChange,
}: {
  deviceId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detail Device</SheetTitle>
          <SheetDescription>Informasi lengkap perangkat.</SheetDescription>
        </SheetHeader>
        {deviceId ? <DeviceDetail deviceId={deviceId} /> : null}
      </SheetContent>
    </Sheet>
  )
}
