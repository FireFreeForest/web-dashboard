import { useQuery } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

import { NodeActivityCard } from "@/components/nodes/node-activity-card"
import { NodeCommandCard } from "@/components/nodes/node-command-card"
import { NodeDetailHeader } from "@/components/nodes/node-detail-header"
import { NodeDetailSkeleton } from "@/components/nodes/node-detail-skeleton"
import { NodeDetailsCard } from "@/components/nodes/node-details-card"
import { NodeEnvironmentTrendsCard } from "@/components/nodes/node-environment-trends-card"
import { NodeFireTrendsCard } from "@/components/nodes/node-fire-trends-card"
import { NodeLiveTelemetryCard } from "@/components/nodes/node-live-telemetry-card"
import { NodeLocationCard } from "@/components/nodes/node-location-card"
import { NodeWaterPumpTrendsCard } from "@/components/nodes/node-waterpump-trends-card"
import { useLiveNow } from "@/components/nodes/use-live-now"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { deviceStatusQueryOptions } from "@/features/devices/queries"
import { ApiError } from "@/lib/api/types"

export function NodeDetailPage({ deviceId }: { deviceId: string }) {
  const query = useQuery({
    ...deviceStatusQueryOptions(deviceId),
    refetchInterval: 30_000,
  })
  const environmentNow = useLiveNow(deviceId, "environment")
  const fireNow = useLiveNow(deviceId, "fire")

  if (query.isPending) {
    return <NodeDetailSkeleton />
  }

  if (query.isError || !query.data) {
    const isNotFound =
      query.error instanceof ApiError && query.error.status === 404

    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>
              {isNotFound ? "Device tidak ditemukan" : "Gagal memuat Device"}
            </EmptyTitle>
            <EmptyDescription>
              {isNotFound
                ? "Device dengan ID tersebut tidak tersedia."
                : query.error?.message}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" onClick={() => void query.refetch()}>
                <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
                Coba lagi
              </Button>
              <Button render={<Link to="/nodes" />}>Kembali ke Device</Button>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const {
    device,
    environment,
    fire,
    risk_level,
    last_seen_at,
    status,
    uptime_seconds,
  } = query.data

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <NodeDetailHeader
        device={device}
        riskLevel={risk_level}
        lastSeenAt={last_seen_at}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <NodeLiveTelemetryCard environment={environment} fire={fire} />
          <NodeEnvironmentTrendsCard deviceId={deviceId} now={environmentNow} />
          <NodeFireTrendsCard deviceId={deviceId} now={fireNow} />
          <NodeWaterPumpTrendsCard deviceId={deviceId} now={fireNow} />
        </div>
        <div className="flex flex-col gap-4">
          <NodeDetailsCard
            device={device}
            status={status}
            uptimeSeconds={uptime_seconds ?? device.uptime_seconds ?? null}
          />
          <NodeLocationCard device={device} />
          <NodeCommandCard deviceId={deviceId} pump={fire?.pump ?? null} />
          <NodeActivityCard deviceId={deviceId} />
        </div>
      </div>
    </div>
  )
}
