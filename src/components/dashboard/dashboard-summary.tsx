import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowRight01Icon,
  RadioTowerIcon,
  RefreshIcon,
  Wifi01Icon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

import { EventItem } from "@/components/events/event-item"
import { SeverityBadge } from "@/components/events/event-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
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
import { useDeviceMap } from "@/features/devices/queries"
import type { Severity } from "@/features/events/types"
import { cn } from "@/lib/utils"

const SEVERITIES: Severity[] = ["critical", "warning", "error"]

function DeviceStat({
  icon,
  value,
  label,
  iconClassName,
  valueClassName,
}: {
  icon: typeof RadioTowerIcon
  value: number
  label: string
  iconClassName?: string
  valueClassName?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground",
          iconClassName
        )}
      >
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4.5" />
      </span>
      <span
        className={cn(
          "font-heading text-2xl leading-none font-semibold tabular-nums",
          valueClassName
        )}
      >
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  )
}

function DevicesSummary({ devices }: { devices: DashboardSummary["devices"] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <DeviceStat
        icon={RadioTowerIcon}
        value={devices.total}
        label="Total Device"
      />
      <DeviceStat
        icon={Wifi01Icon}
        value={devices.online}
        label="Online"
        iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        valueClassName="text-emerald-600 dark:text-emerald-400"
      />
      <DeviceStat
        icon={WifiDisconnected01Icon}
        value={devices.offline}
        label="Offline"
        iconClassName="bg-destructive/10 text-destructive"
        valueClassName="text-muted-foreground"
      />
    </div>
  )
}

function DevicesCard({ devices }: { devices: DashboardSummary["devices"] }) {
  return (
    <Card size="sm">
      <CardContent>
        <h2 className="sr-only">Ringkasan Device</h2>
        <DevicesSummary devices={devices} />
      </CardContent>
    </Card>
  )
}

function AllEventsButton() {
  return (
    <Button size="xs" variant="ghost" render={<Link to="/events" />}>
      Semua Event
      <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
    </Button>
  )
}

function EventSummaryBody({ summary }: { summary: DashboardSummary }) {
  const { active_events: activeEvents, recent_events: recentEvents } = summary
  const devices = useDeviceMap()

  const hasStats =
    activeEvents.total > 0 ||
    SEVERITIES.some((severity) => activeEvents.by_severity[severity] > 0)

  return (
    <>
      {hasStats ? (
        <div className="flex flex-wrap items-center gap-2">
          {activeEvents.total > 0 ? (
            <Badge variant="secondary" className="tabular-nums">
              {activeEvents.total} Event Aktif
            </Badge>
          ) : null}
          {SEVERITIES.map((severity) => {
            const count = activeEvents.by_severity[severity]
            if (count === 0) return null
            return (
              <SeverityBadge key={severity} severity={severity} count={count} />
            )
          })}
        </div>
      ) : null}

      {recentEvents.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">Belum ada Event.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {recentEvents.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              deviceLabel={devices.data?.get(event.device_id)?.device_id}
            />
          ))}
        </ul>
      )}
    </>
  )
}

function EventSummaryCard({ summary }: { summary: DashboardSummary }) {
  return (
    <Card size="sm" className="gap-2">
      <CardHeader className="gap-y-0">
        <CardTitle>Ringkasan Event</CardTitle>
        <CardAction>
          <AllEventsButton />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <EventSummaryBody summary={summary} />
      </CardContent>
    </Card>
  )
}

function EventSummarySection({ summary }: { summary: DashboardSummary }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-base font-medium">Ringkasan Event</h2>
        <AllEventsButton />
      </div>
      <EventSummaryBody summary={summary} />
    </section>
  )
}

function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <>
      <DevicesCard devices={summary.devices} />
      <EventSummaryCard summary={summary} />
    </>
  )
}

function SummarySkeleton() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Skeleton className="h-28 rounded-2xl" />
      <Skeleton className="h-72 rounded-2xl" />
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
    <Card size="sm">
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
    return (
      <div className="pointer-events-auto w-full max-w-sm">
        <SummaryError message={error?.message} onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="pointer-events-auto flex w-full max-w-sm flex-col gap-3">
      <SummaryCards summary={data} />
    </div>
  )
}

export function DashboardMobileSummary() {
  const { data, isPending, isError, error, refetch } = useDashboardSummary()

  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full bg-background/95 shadow-lg backdrop-blur"
          />
        }
      >
        <HugeiconsIcon
          icon={RadioTowerIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Ringkasan
      </DrawerTrigger>
      <DrawerContent>
        <DrawerTitle className="sr-only">Ringkasan dashboard</DrawerTitle>
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
          {isPending ? (
            <SummarySkeleton />
          ) : isError || !data ? (
            <SummaryError message={error?.message} onRetry={() => refetch()} />
          ) : (
            <>
              <DevicesSummary devices={data.devices} />
              <EventSummarySection summary={data} />
            </>
          )}
        </div>
        <DrawerFooter>
          <DrawerClose
            render={
              <Button type="button" variant="outline" className="w-full" />
            }
          >
            Tutup
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
