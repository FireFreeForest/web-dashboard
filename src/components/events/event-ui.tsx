import type { ComponentProps } from "react"

import { Badge } from "@/components/ui/badge"
import type { EventStatus, EventType, Severity } from "@/features/events/types"

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

const severityMeta: Record<Severity, { label: string; variant: BadgeVariant }> =
  {
    error: { label: "Error", variant: "outline" },
    warning: { label: "Warning", variant: "secondary" },
    critical: { label: "Critical", variant: "destructive" },
  }

const statusMeta: Record<
  EventStatus,
  { label: string; variant: BadgeVariant }
> = {
  active: { label: "Active", variant: "default" },
  acknowledged: { label: "Acknowledged", variant: "secondary" },
  resolved: { label: "Resolved", variant: "outline" },
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = severityMeta[severity]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}

export function StatusBadge({ status }: { status: EventStatus }) {
  const meta = statusMeta[status]
  return <Badge variant={meta.variant}>{meta.label}</Badge>
}
