import type { QueryClient } from "@tanstack/react-query"

import { commandKeys } from "@/features/commands/queries"
import { dashboardKeys } from "@/features/dashboard/queries"
import { deviceKeys } from "@/features/devices/queries"
import type {
  Device,
  DeviceStatus,
  DeviceStatusDetail,
} from "@/features/devices/types"
import { eventKeys } from "@/features/events/queries"
import type { Event, EventDetail } from "@/features/events/types"
import { telemetryKeys } from "@/features/telemetry/queries"
import type {
  EnvironmentTelemetry,
  FireTelemetry,
  LatestTelemetry,
} from "@/features/telemetry/types"

import type { RealtimeMessage } from "./types"

type DevicePresencePatch = {
  status?: DeviceStatus
  last_seen_at?: string | null
}

function patchDevicePresence(
  queryClient: QueryClient,
  deviceId: string,
  patch: DevicePresencePatch
): void {
  queryClient.setQueryData<Device>(deviceKeys.detail(deviceId), (current) =>
    current ? { ...current, ...patch } : current
  )

  queryClient.setQueryData<LatestTelemetry>(
    telemetryKeys.latest(deviceId),
    (current) =>
      current
        ? {
            ...current,
            device: { ...current.device, ...patch },
          }
        : current
  )

  queryClient.setQueryData<DeviceStatusDetail>(
    deviceKeys.status(deviceId),
    (current) =>
      current
        ? {
            ...current,
            status: patch.status ?? current.status,
            last_seen_at:
              patch.last_seen_at !== undefined
                ? patch.last_seen_at
                : current.last_seen_at,
            device: { ...current.device, ...patch },
          }
        : current
  )
}

const TELEMETRY_INVALIDATION_THROTTLE_MS = 3_000

const telemetryInvalidationTimers = new Map<string, number>()

function invalidateTelemetrySeries(
  queryClient: QueryClient,
  deviceId: string,
  kind: "environment" | "fire"
): void {
  const invalidationKey = `${kind}:${deviceId}`

  if (telemetryInvalidationTimers.has(invalidationKey)) {
    return
  }

  const timer = window.setTimeout(() => {
    telemetryInvalidationTimers.delete(invalidationKey)

    void queryClient.invalidateQueries({
      queryKey: [...telemetryKeys.all, kind, deviceId],
      predicate: (query) => !query.queryKey.includes("aggregate"),
    })
  }, TELEMETRY_INVALIDATION_THROTTLE_MS)

  telemetryInvalidationTimers.set(invalidationKey, timer)
}

function updateEnvironmentTelemetry(
  queryClient: QueryClient,
  deviceId: string,
  telemetry: EnvironmentTelemetry
): void {
  patchDevicePresence(queryClient, deviceId, {
    status: "online",
    last_seen_at: telemetry.received_at,
  })

  queryClient.setQueryData<LatestTelemetry>(
    telemetryKeys.latest(deviceId),
    (current) => (current ? { ...current, environment: telemetry } : current)
  )

  queryClient.setQueryData<DeviceStatusDetail>(
    deviceKeys.status(deviceId),
    (current) =>
      current
        ? {
            ...current,
            environment: telemetry,
            status: "online",
            last_seen_at: telemetry.received_at,
          }
        : current
  )

  invalidateTelemetrySeries(queryClient, deviceId, "environment")
}

function updateFireTelemetry(
  queryClient: QueryClient,
  deviceId: string,
  telemetry: FireTelemetry
): void {
  patchDevicePresence(queryClient, deviceId, {
    status: "online",
    last_seen_at: telemetry.received_at,
  })

  queryClient.setQueryData<LatestTelemetry>(
    telemetryKeys.latest(deviceId),
    (current) => (current ? { ...current, fire: telemetry } : current)
  )

  queryClient.setQueryData<DeviceStatusDetail>(
    deviceKeys.status(deviceId),
    (current) =>
      current
        ? {
            ...current,
            fire: telemetry,
            status: "online",
            last_seen_at: telemetry.received_at,
          }
        : current
  )

  invalidateTelemetrySeries(queryClient, deviceId, "fire")
}

function updateEvent(queryClient: QueryClient, event: Event): void {
  queryClient.setQueryData<EventDetail>(
    eventKeys.detail(event.id),
    (current) => (current ? { ...current, ...event } : current)
  )
  void queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
  void queryClient.invalidateQueries({
    queryKey: eventKeys.timelines(event.id),
  })
  void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
}

export function applyRealtimeMessage(
  queryClient: QueryClient,
  message: RealtimeMessage
): void {
  switch (message.type) {
    case "connected":
      return
    case "telemetry.environment":
      updateEnvironmentTelemetry(
        queryClient,
        message.device_id,
        message.data.telemetry
      )
      return
    case "telemetry.fire":
      updateFireTelemetry(
        queryClient,
        message.device_id,
        message.data.telemetry
      )
      return
    case "event.created":
    case "event.updated":
    case "event.resolved":
      updateEvent(queryClient, message.data.event)
      return
    case "risk.updated": {
      queryClient.setQueryData<LatestTelemetry>(
        telemetryKeys.latest(message.device_id),
        (current) =>
          current ? { ...current, risk_level: message.data.level } : current
      )
      queryClient.setQueryData<DeviceStatusDetail>(
        deviceKeys.status(message.device_id),
        (current) =>
          current ? { ...current, risk_level: message.data.level } : current
      )
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      return
    }
    case "device.status": {
      const patch: DevicePresencePatch = {
        status: message.data.status,
      }

      if (message.data.last_seen_at) {
        patch.last_seen_at = message.data.last_seen_at
      }

      patchDevicePresence(queryClient, message.device_id, patch)
      void queryClient.invalidateQueries({ queryKey: deviceKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all })
      return
    }
    case "command.issued":
    case "command.ack":
    case "command.timeout":
      void queryClient.invalidateQueries({ queryKey: commandKeys.all })
      return
  }
}
