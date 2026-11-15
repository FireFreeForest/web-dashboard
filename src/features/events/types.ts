export type EventType =
  | "FIRE_DETECTED"
  | "SMOKE_DETECTED"
  | "TEMPERATURE_HIGH"
  | "SOIL_DRY"
  | "DEVICE_OFFLINE"
  | "SENSOR_ERROR"

export type Severity = "error" | "warning" | "critical"

export type EventStatus = "active" | "acknowledged" | "resolved"

export type Event = {
  id: string
  device_id: string
  event_type: EventType
  severity: Severity
  source: string
  message: string
  status: EventStatus
  metadata: Record<string, unknown> | null
  triggered_at: string
  acknowledged_by: string | null
  acknowledged_at: string | null
  resolved_at: string | null
  created_at: string
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
