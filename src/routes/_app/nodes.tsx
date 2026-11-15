import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { ServerStackIcon } from "@hugeicons/core-free-icons"

import { CreateDeviceSheet } from "@/components/devices/create-device-sheet"
import { DeviceDetailSheet } from "@/components/devices/device-detail-sheet"
import {
  DeviceStatusPill,
  formatDateTime,
} from "@/components/devices/device-ui"
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
import { useMe } from "@/features/auth/queries"
import { useDevices } from "@/features/devices/queries"
import type { Device } from "@/features/devices/types"

export const Route = createFileRoute("/_app/nodes")({
  staticData: { crumb: "Nodes" },
  component: NodesPage,
})

function DeviceCard({
  device,
  onSelect,
}: {
  device: Device
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex w-full cursor-pointer rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card size="sm" className="w-full">
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
            <DeviceStatusPill status={device.status} />
          </div>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <span>{device.location_name || "—"}</span>
            <span>Last seen {formatDateTime(device.last_seen_at)}</span>
          </div>
        </CardContent>
      </Card>
    </button>
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
  const { data: user } = useMe()
  const { data, isPending, isError, error, refetch } = useDevices()

  const devices = data?.data ?? []
  const total = data?.meta.total ?? 0
  const isAdmin = user?.role === "admin"
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Nodes
          </h1>
          <p className="text-sm text-muted-foreground">
            {isPending ? "Memuat..." : `${total} perangkat terdaftar`}
          </p>
        </div>
        {isAdmin ? <CreateDeviceSheet /> : null}
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
            <DeviceCard
              key={device.id}
              device={device}
              onSelect={() => setSelectedDeviceId(device.device_id)}
            />
          ))}
        </div>
      ) : null}

      <DeviceDetailSheet
        deviceId={selectedDeviceId}
        open={selectedDeviceId !== null}
        canEdit={isAdmin}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDeviceId(null)
          }
        }}
      />
    </div>
  )
}
