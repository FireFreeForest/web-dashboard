import { useMemo } from "react"
import { useQueries } from "@tanstack/react-query"

import {
  deviceStatusQueryOptions,
  useAllDevices,
} from "@/features/devices/queries"
import type { Device, DeviceStatusDetail } from "@/features/devices/types"
import { adcToInvertedPercent, adcToPercent } from "@/features/telemetry/utils"
import type { MapNode } from "@/lib/nodes"

type DeviceWithCoordinates = Device & {
  latitude: number
  longitude: number
}

function hasCoordinates(device: Device): device is DeviceWithCoordinates {
  const { latitude, longitude } = device

  return (
    typeof latitude === "number" &&
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    typeof longitude === "number" &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  )
}

export function toMapNode(
  device: DeviceWithCoordinates,
  status?: DeviceStatusDetail
): MapNode {
  const environment = status?.environment
  const fire = status?.fire

  return {
    id: device.device_id,
    name: device.name || device.device_id,
    region: device.location_name || "—",
    coordinates: {
      longitude: device.longitude,
      latitude: device.latitude,
    },
    environment: {
      temperatureC: environment?.temperature ?? null,
      humidityPct: environment?.humidity ?? null,
      soilMoisturePct: environment
        ? adcToPercent(environment.soil_moisture)
        : null,
    },
    fire: {
      fireIntensity: fire
        ? fire.flame_level != null
          ? adcToInvertedPercent(fire.flame_level)
          : fire.flame_detected
            ? 100
            : null
        : null,
      smokeIntensity: fire ? adcToPercent(fire.smoke_level) : null,
    },
    actuator: {
      pumpState: fire ? (fire.pump ? "on" : "off") : null,
    },
    online: (status?.status ?? device.status) === "online",
    riskLevel: status?.risk_level ?? "UNKNOWN",
    lastSeen: status?.last_seen_at ?? device.last_seen_at,
  }
}

export function useMapNodes() {
  const devicesQuery = useAllDevices()

  const mappableDevices = useMemo(
    () => (devicesQuery.data ?? []).filter(hasCoordinates),
    [devicesQuery.data]
  )

  const statusRequests = useMemo(
    () =>
      mappableDevices.map((device) => ({
        ...deviceStatusQueryOptions(device.device_id),
        refetchInterval: 30_000,
      })),
    [mappableDevices]
  )

  const statusQueries = useQueries({ queries: statusRequests })

  const nodes = useMemo(
    () =>
      mappableDevices.map((device, index) =>
        toMapNode(device, statusQueries[index]?.data)
      ),
    [mappableDevices, statusQueries]
  )

  const statusError = statusQueries.find((query) => query.error)?.error ?? null

  return {
    nodes,
    isLoading: devicesQuery.isPending,
    isError: devicesQuery.isError,
    error: devicesQuery.error,
    statusError,
    refetch: devicesQuery.refetch,
  }
}
