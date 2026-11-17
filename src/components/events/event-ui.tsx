import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import type { EventStatus, EventType, Severity } from "@/features/events/types"
import { cn } from "@/lib/utils"

export type BadgeVariant = ComponentProps<typeof Badge>["variant"]

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "medium",
})

export function formatTimestamp(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  FIRE_DETECTED: "Api Terdeteksi",
  SMOKE_DETECTED: "Asap Terdeteksi",
  TEMPERATURE_HIGH: "Suhu Tinggi",
  SOIL_DRY: "Tanah Kering",
  DEVICE_OFFLINE: "Device Offline",
  SENSOR_ERROR: "Sensor Error",
}

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABEL) as Array<
  [EventType, string]
>

type SeverityMeta = {
  label: string
  variant: BadgeVariant
  badgeClassName: string
  iconClassName: string
}

export const SEVERITY_META: Record<Severity, SeverityMeta> = {
  error: {
    label: "Error",
    variant: "outline",
    badgeClassName: "border-border bg-muted/60 text-muted-foreground",
    iconClassName: "bg-muted text-muted-foreground",
  },
  warning: {
    label: "Peringatan",
    variant: "outline",
    badgeClassName:
      "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    iconClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  critical: {
    label: "Kritis",
    variant: "outline",
    badgeClassName:
      "border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/20",
    iconClassName: "bg-destructive/10 text-destructive",
  },
}

const statusMeta: Record<
  EventStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "Active", variant: "default" },
  acknowledged: { label: "Acknowledged", variant: "secondary" },
  resolved: { label: "Resolved", variant: "outline" },
}

export function SeverityBadge({
  severity,
  count,
  className,
}: {
  severity: Severity
  count?: number
  className?: string
}) {
  const meta = SEVERITY_META[severity]
  return (
    <Badge
      variant={meta.variant}
      className={cn(
        meta.badgeClassName,
        count !== undefined && "tabular-nums",
        className
      )}
    >
      {count !== undefined ? `${count} ${meta.label}` : meta.label}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: EventStatus }) {
  const meta = statusMeta[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}
