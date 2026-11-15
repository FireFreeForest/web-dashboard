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

export type LatestTelemetry = {
  device: Device
  environment: EnvironmentTelemetry | null
  fire: FireTelemetry | null
  risk_level: RiskLevel
}

export type TelemetryListParams = {
  page?: number
  per_page?: number
  from?: string
  to?: string
}
