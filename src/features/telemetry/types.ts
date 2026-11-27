import type { Device } from "@/features/devices/types"

export type RiskLevel = "NORMAL" | "WASPADA" | "BAHAYA" | "DARURAT" | "UNKNOWN"

export type EnvironmentTelemetry = {
  id: number
  device_id: string
  temperature: number | null
  humidity: number | null
  soil_moisture: number
  recorded_at: string
  received_at: string
}

export type FireTelemetry = {
  id: number
  device_id: string
  flame_detected: boolean
  flame_level: number | null
  smoke_level: number
  pump: boolean
  buzzer: boolean
  recorded_at: string
  received_at: string
}

export type DeviceTelemetry = {
  id: number
  device_id: string
  firmware_version: string
  wifi_rssi: number | null
  battery_voltage: number | null
  battery_percentage: number | null
  recorded_at: string
  received_at: string
}

export type LatestTelemetry = {
  device: Device
  environment: EnvironmentTelemetry | null
  fire: FireTelemetry | null
  device_telemetry: DeviceTelemetry | null
  risk_level: RiskLevel
}

export type TelemetrySeriesMode = "raw" | "raw_decimated" | "aggregate"

export type EnvironmentAggregatePoint = {
  bucket_start: string
  temperature: number | null
  humidity: number | null
  soil_moisture: number
  sample_count: number
}

export type FireAggregatePoint = {
  bucket_start: string
  flame_level: number | null
  smoke_level: number
  flame_detected_ratio: number
  pump_on_ratio: number
  buzzer_on_ratio: number
  sample_count: number
}

export type EnvironmentAggregate = {
  device_id: string
  from: string
  to: string
  interval_minutes: number
  bucket_timezone: "Asia/Jakarta"
  mode?: TelemetrySeriesMode
  decimated?: boolean
  source_points?: number
  returned_points?: number
  points: Array<EnvironmentAggregatePoint | EnvironmentTelemetry>
}

export type FireAggregate = {
  device_id: string
  from: string
  to: string
  interval_minutes: number
  bucket_timezone: "Asia/Jakarta"
  mode?: TelemetrySeriesMode
  decimated?: boolean
  source_points?: number
  returned_points?: number
  points: Array<FireAggregatePoint | FireTelemetry>
}

export type TelemetryListParams = {
  page?: number
  per_page?: number
  from?: string
  to?: string
}

export type TelemetryAggregateParams = {
  from: string
  to: string
  interval?: number
}
