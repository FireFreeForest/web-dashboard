export type DeviceStatus = "online" | "offline"

export type RiskLevel = "NORMAL" | "WASPADA" | "BAHAYA" | "DARURAT" | "UNKNOWN"

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
  created_at: string
  updated_at: string
}

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

export type DeviceStatusDetail = {
  device: Device
  status: DeviceStatus
  last_seen_at: string | null
  environment: EnvironmentTelemetry | null
  fire: FireTelemetry | null
  risk_level: RiskLevel
  server_time: string
}

export type DeviceListParams = {
  page?: number
  per_page?: number
}

export type CreateDeviceInput = {
  device_id: string
  name?: string
  location_name?: string
  latitude?: number
  longitude?: number
  firmware_version?: string
}

export type UpdateDeviceInput = {
  name?: string
  location_name?: string
  latitude?: number
  longitude?: number
  firmware_version?: string
}
