import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { ServerStackIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useDevices } from "@/features/devices/queries"
import type { Device, DeviceStatus } from "@/features/devices/types"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/nodes")({
  staticData: { crumb: "Nodes" },
  component: NodesPage,
})

const statusMeta: Record<
  DeviceStatus,
  { label: string; dotClassName: string; pillClassName: string }
> = {
  online: {
    label: "Online",
    dotClassName: "bg-primary",
    pillClassName: "bg-primary/10 text-primary",
  },
  offline: {
    label: "Offline",
    dotClassName: "bg-muted-foreground",
    pillClassName: "bg-muted text-muted-foreground",
  },
}

function StatusPill({ status }: { status: DeviceStatus }) {
  const meta = statusMeta[status]

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        meta.pillClassName
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dotClassName)} />
      {meta.label}
    </span>
  )
}

function formatLastSeen(value: string | null): string {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleString()
}

function DeviceCard({ device }: { device: Device }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate font-heading text-sm font-semibold">
              {device.name}
            </p>
            <span className="truncate font-mono text-[11px] tracking-wide text-muted-foreground">
              {device.device_id}
            </span>
          </div>
          <StatusPill status={device.status} />
        </div>
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span>{device.location_name || "—"}</span>
          <span>Last seen {formatLastSeen(device.last_seen_at)}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function DeviceListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-28 rounded-2xl" />
      ))}
    </div>
  )
}

function DeviceListEmpty() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={ServerStackIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>No nodes yet</EmptyTitle>
          <EmptyDescription>
            Node management will appear here once devices are connected.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}

function DeviceListError({
  message,
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={ServerStackIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>Gagal memuat perangkat</EmptyTitle>
          <EmptyDescription>{message}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" variant="outline" onClick={onRetry}>
            Coba lagi
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}

function NodesPage() {
  const { data, isPending, isError, error, refetch } = useDevices()

  const devices = data?.data ?? []
  const total = data?.meta.total ?? 0

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Nodes
        </h1>
        <p className="text-sm text-muted-foreground">
          {isPending ? "Memuat..." : `${total} perangkat terdaftar`}
        </p>
      </header>

      {isPending ? <DeviceListSkeleton /> : null}
      {isError ? (
        <DeviceListError message={error?.message} onRetry={() => refetch()} />
      ) : null}
      {!isPending && !isError && devices.length === 0 ? (
        <DeviceListEmpty />
      ) : null}
      {!isPending && !isError && devices.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
