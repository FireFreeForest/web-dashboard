import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowRight01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

import {
  EVENT_TYPE_LABEL,
  formatTimestamp,
  SeverityBadge,
  StatusBadge,
} from "@/components/events/event-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardSummary } from "@/features/dashboard/queries"
import type { DashboardSummary } from "@/features/dashboard/types"
import type { Event, Severity } from "@/features/events/types"
import type { RiskLevel } from "@/features/telemetry/types"
import { cn } from "@/lib/utils"

const SEVERITIES: Severity[] = ["critical", "warning", "error"]

const RISK_LEVELS: RiskLevel[] = [
  "NORMAL",
  "WASPADA",
  "BAHAYA",
  "DARURAT",
  "UNKNOWN",
]

const RISK_META: Record<RiskLevel, { label: string; dotClassName: string }> = {
  NORMAL: { label: "Normal", dotClassName: "bg-emerald-500" },
  WASPADA: { label: "Waspada", dotClassName: "bg-amber-500" },
  BAHAYA: { label: "Bahaya", dotClassName: "bg-orange-500" },
  DARURAT: { label: "Darurat", dotClassName: "bg-destructive" },
  UNKNOWN: { label: "Unknown", dotClassName: "bg-muted-foreground" },
}

function StatCell({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-muted/50 p-2.5">
      <span
        className={cn(
          "font-heading text-xl leading-none font-semibold tabular-nums",
          tone
        )}
      >
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

function RiskChip({ level, count }: { level: RiskLevel; count: number }) {
  const meta = RISK_META[level]

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs">
      <span className={cn("size-1.5 rounded-full", meta.dotClassName)} />
      <span className="text-muted-foreground">{meta.label}</span>
      <span className="font-medium tabular-nums">{count}</span>
    </span>
  )
}

function SummaryCard({ summary }: { summary: DashboardSummary }) {
  const { devices, active_events: activeEvents, risk } = summary

  return (
    <Card size="sm" className="shadow-lg">
      <CardHeader>
        <CardTitle>Ringkasan Sistem</CardTitle>
        <CardDescription>Kondisi terkini seluruh perangkat.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <StatCell label="Total device" value={devices.total} />
          <StatCell
            label="Online"
            value={devices.online}
            tone="text-emerald-600 dark:text-emerald-400"
          />
          <StatCell
            label="Offline"
            value={devices.offline}
            tone="text-muted-foreground"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Event aktif
            </span>
            <Badge variant="secondary" className="tabular-nums">
              {activeEvents.total}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {SEVERITIES.map((severity) => (
              <span key={severity} className="inline-flex items-center gap-1.5">
                <SeverityBadge severity={severity} />
                <span className="text-xs font-medium tabular-nums">
                  {activeEvents.by_severity[severity]}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Risiko device
          </span>
          <div className="flex flex-wrap gap-1.5">
            {RISK_LEVELS.map((level) => (
              <RiskChip key={level} level={level} count={risk.counts[level]} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentEventItem({ event }: { event: Event }) {
  return (
    <li className="flex flex-col gap-1 py-2 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium">
          {EVENT_TYPE_LABEL[event.event_type]}
        </span>
        <SeverityBadge severity={event.severity} />
      </div>
      <p className="line-clamp-1 text-xs text-muted-foreground">
        {event.message}
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-muted-foreground">
          {formatTimestamp(event.triggered_at)}
        </span>
        <StatusBadge status={event.status} />
      </div>
    </li>
  )
}

function RecentEventsCard({ events }: { events: Event[] }) {
  return (
    <Card size="sm" className="shadow-lg">
      <CardHeader>
        <CardTitle>Event Terbaru</CardTitle>
        <CardAction>
          <Button size="xs" variant="ghost" render={<Link to="/events" />}>
            Semua event
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">Belum ada event.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {events.map((event) => (
              <RecentEventItem key={event.id} event={event} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function SummarySkeleton() {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
      <Skeleton className="h-64 w-full rounded-2xl xl:max-w-md" />
      <Skeleton className="h-52 w-full rounded-2xl xl:max-w-sm" />
    </div>
  )
}

function SummaryError({
  message,
  onRetry,
}: {
  message?: string
  onRetry: () => void
}) {
  return (
    <Card size="sm" className="shadow-lg">
      <Empty className="p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>Gagal memuat ringkasan</EmptyTitle>
          <EmptyDescription>{message}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm" variant="outline" onClick={onRetry}>
            <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
            Coba lagi
          </Button>
        </EmptyContent>
      </Empty>
    </Card>
  )
}

export function DashboardOverview() {
  const { data, isPending, isError, error, refetch } = useDashboardSummary()

  if (isPending) {
    return <SummarySkeleton />
  }

  if (isError || !data) {
    return <SummaryError message={error?.message} onRetry={() => refetch()} />
  }

  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
      <div className="pointer-events-auto w-full max-w-md">
        <SummaryCard summary={data} />
      </div>
      <div className="pointer-events-auto w-full max-w-sm">
        <RecentEventsCard events={data.recent_events} />
      </div>
    </div>
  )
}
