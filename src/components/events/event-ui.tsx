import type { ComponentProps } from "react"
import {
  Activity01Icon,
  AlarmSmokeIcon,
  Alert02Icon,
  BatteryIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  FireIcon,
  Notification01Icon,
  SoilMoistureFieldIcon,
  TaskDone01Icon,
  ThermometerSunIcon,
  Tick02Icon,
  TimelineEventIcon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons"
import type { IconSvgElement } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import type {
  EventStatus,
  EventType,
  Severity,
  TimelineKind,
  TimelineLevel,
} from "@/features/events/types"
import { cn } from "@/lib/utils"

export type BadgeVariant = ComponentProps<typeof Badge>["variant"]

export const EVENT_TYPE_LABEL: Record<EventType, string> = {
  FIRE_DETECTED: "Api Terdeteksi",
  SMOKE_DETECTED: "Asap Terdeteksi",
  TEMPERATURE_HIGH: "Suhu Tinggi",
  SOIL_DRY: "Tanah Kering",
  DEVICE_OFFLINE: "Device Offline",
  SENSOR_ERROR: "Galat Sensor",
  LOW_BATTERY: "Baterai Lemah",
}

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABEL) as Array<
  [EventType, string]
>

export const EVENT_TYPE_ICON: Record<EventType, typeof FireIcon> = {
  FIRE_DETECTED: FireIcon,
  SMOKE_DETECTED: AlarmSmokeIcon,
  TEMPERATURE_HIGH: ThermometerSunIcon,
  SOIL_DRY: SoilMoistureFieldIcon,
  DEVICE_OFFLINE: WifiDisconnected01Icon,
  SENSOR_ERROR: Activity01Icon,
  LOW_BATTERY: BatteryIcon,
}

type SeverityMeta = {
  label: string
  variant: BadgeVariant
  badgeClassName: string
  iconClassName: string
}

export const SEVERITY_META: Record<Severity, SeverityMeta> = {
  error: {
    label: "Galat",
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

const STATUS_META: Record<
  EventStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "Aktif", variant: "default" },
  acknowledged: { label: "Dikonfirmasi", variant: "secondary" },
  resolved: { label: "Selesai", variant: "outline" },
}

export const SEVERITY_FILTER_OPTIONS: Array<{
  value: Severity | "all"
  label: string
}> = [
  { value: "all", label: "Semua Keparahan" },
  { value: "error", label: SEVERITY_META.error.label },
  { value: "warning", label: SEVERITY_META.warning.label },
  { value: "critical", label: SEVERITY_META.critical.label },
]

export const STATUS_FILTER_OPTIONS: Array<{
  value: EventStatus | "all"
  label: string
}> = [
  { value: "all", label: "Semua Status" },
  { value: "active", label: STATUS_META.active.label },
  { value: "acknowledged", label: STATUS_META.acknowledged.label },
  { value: "resolved", label: STATUS_META.resolved.label },
]

export const EVENT_TYPE_FILTER_OPTIONS: Array<{
  value: EventType | "all"
  label: string
}> = [
  { value: "all", label: "Semua Tipe" },
  ...EVENT_TYPE_OPTIONS.map(([value, label]) => ({ value, label })),
]

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
  const meta = STATUS_META[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

export const TIMELINE_KIND_ICON: Record<TimelineKind, IconSvgElement> = {
  CREATED: TimelineEventIcon,
  NOTIFICATION: Notification01Icon,
  REMINDER: Clock01Icon,
  ESCALATION: Alert02Icon,
  ACKNOWLEDGED: Tick02Icon,
  RESOLVED: TaskDone01Icon,
  AUTO_RESOLVED: CheckmarkCircle02Icon,
}

export const TIMELINE_LEVEL_META: Record<
  TimelineLevel,
  { iconClassName: string }
> = {
  info: {
    iconClassName: "bg-muted text-muted-foreground",
  },
  success: {
    iconClassName: "bg-primary/10 text-primary",
  },
  warning: {
    iconClassName: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  error: {
    iconClassName: "bg-destructive/10 text-destructive",
  },
  critical: {
    iconClassName: "bg-destructive/10 text-destructive",
  },
  muted: {
    iconClassName: "bg-muted text-muted-foreground",
  },
}
