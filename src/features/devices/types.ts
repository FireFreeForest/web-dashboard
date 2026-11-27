import type {
  DeviceTelemetry,
  EnvironmentTelemetry,
  FireTelemetry,
  RiskLevel,
} from "@/features/telemetry/types"

import type { CreateDeviceFormValues } from "./schema"

export type DeviceStatus = "online" | "offline"

export type Device = {
  id: string
  device_id: string
  name: string
  location_name: string
  latitude: number | null
  longitude: number | null
  status: DeviceStatus
  firmware_version: string
  last_seen_at: string | null
  online_since?: string | null
  uptime_seconds: number
  created_at: string
  updated_at: string
}

export type DeviceStatusDetail = {
  device: Device
  status: DeviceStatus
  last_seen_at: string | null
  online_since: string | null
  uptime_seconds: number
  environment: EnvironmentTelemetry | null
  fire: FireTelemetry | null
  device_telemetry: DeviceTelemetry | null
  risk_level: RiskLevel
  server_time: string
}

export type DeviceListParams = {
  page?: number
  per_page?: number
  q?: string
}

export type CreateDeviceInput = CreateDeviceFormValues

export type UpdateDeviceInput = {
  name?: string
  location_name?: string
  latitude?: number
  longitude?: number
}
