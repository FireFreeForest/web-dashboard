import type {
  CommandAction,
  CommandOrigin,
  CommandStatus,
} from "@/features/commands/types"
import type { DeviceStatus } from "@/features/devices/types"
import type { Event } from "@/features/events/types"
import type {
  EnvironmentTelemetry,
  FireTelemetry,
  RiskLevel,
} from "@/features/telemetry/types"

export interface RealtimeTicket {
  ticket: string
  expires_in: number
}

export type RealtimeEventType =
  | "connected"
  | "telemetry.environment"
  | "telemetry.fire"
  | "event.created"
  | "event.updated"
  | "event.resolved"
  | "risk.updated"
  | "device.status"
  | "command.issued"
  | "command.ack"
  | "command.timeout"

export type RealtimeRiskLevel = Exclude<RiskLevel, "UNKNOWN">

export interface TelemetryEnvironmentData {
  telemetry: EnvironmentTelemetry
  device_id: string
}

export interface TelemetryFireData {
  telemetry: FireTelemetry
  device_id: string
}

export interface EventData {
  event: Event
  device_id: string
}

export interface RiskUpdatedData {
  level: RealtimeRiskLevel
}

export interface DeviceStatusData {
  status: DeviceStatus
  online: boolean
  last_seen_at?: string
}

export interface CommandIssuedData {
  command_id: string
  action: CommandAction
  origin: CommandOrigin
  status: CommandStatus
  payload: Record<string, unknown>
}

export interface CommandAckData {
  command_id: string
  status: CommandStatus
  message: string
  device_id: string
}

export interface CommandTimeoutData {
  command_id: string
}

export type RealtimeMessage =
  | { type: "connected" }
  | {
      type: "telemetry.environment"
      device_id: string
      data: TelemetryEnvironmentData
      ts?: string
    }
  | {
      type: "telemetry.fire"
      device_id: string
      data: TelemetryFireData
      ts?: string
    }
  | {
      type: "event.created" | "event.updated" | "event.resolved"
      device_id: string
      data: EventData
      ts?: string
    }
  | {
      type: "risk.updated"
      device_id: string
      data: RiskUpdatedData
      ts?: string
    }
  | {
      type: "device.status"
      device_id: string
      data: DeviceStatusData
      ts?: string
    }
  | {
      type: "command.issued"
      device_id: string
      data: CommandIssuedData
      ts?: string
    }
  | {
      type: "command.ack"
      device_id: string
      data: CommandAckData
      ts?: string
    }
  | {
      type: "command.timeout"
      device_id: string
      data: CommandTimeoutData
      ts?: string
    }
