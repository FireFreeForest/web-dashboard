import type { Device } from "@/features/devices/types"

export type EventType =
  | "FIRE_DETECTED"
  | "SMOKE_DETECTED"
  | "TEMPERATURE_HIGH"
  | "SOIL_DRY"
  | "DEVICE_OFFLINE"
  | "SENSOR_ERROR"

export type Severity = "error" | "warning" | "critical"

export type EventStatus = "active" | "acknowledged" | "resolved"

export type EventMetadata = {
  temperature?: number
  humidity?: number
  soil_moisture?: number
  flame_detected?: boolean
  flame_level?: number
  smoke_level?: number
  pump?: boolean
}

export type Event = {
  id: string
  device_id: string
  device?: Device | null
  event_type: EventType
  severity: Severity
  source: string
  message: string
  status: EventStatus
  metadata: EventMetadata | null
  triggered_at: string
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolved_by: string | null
  resolved_at: string | null
  created_at: string
}

export type TimelineKind =
  | "CREATED"
  | "NOTIFICATION"
  | "REMINDER"
  | "ESCALATION"
  | "ACKNOWLEDGED"
  | "RESOLVED"
  | "AUTO_RESOLVED"

export type TimelineLevel =
  "info" | "success" | "warning" | "error" | "critical" | "muted"

export type TimelineOutcome = "sent" | "partial" | "failed" | "skipped"

export type TimelineInclude = "all" | "important"

export type EventTimelineActor = {
  type: "system" | "user"
  id?: string | null
  name: string
  role?: "admin" | "petugas" | "viewer"
}

export type EventTimeline = {
  id: number
  event_id: string
  kind: TimelineKind
  title: string
  description: string
  outcome?: TimelineOutcome | null
  level: TimelineLevel
  actor: EventTimelineActor
  metadata?: Record<string, unknown> | null
  occurred_at: string
}

export type EventDetail = Event & {
  timeline_preview: EventTimeline[]
  timeline_total: number
  timeline_has_more: boolean
}

export type EventTimelineParams = {
  include?: TimelineInclude
  page?: number
  per_page?: number
}

export type EventListParams = {
  page?: number
  per_page?: number
  severity?: Severity
  status?: EventStatus
  event_type?: EventType
  device_id?: string
  from?: string
  to?: string
}
