import { queryOptions, useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"

import type { LatestTelemetry } from "./types"

export const telemetryKeys = {
  all: ["telemetry"] as const,
  latest: (deviceId: string) =>
    [...telemetryKeys.all, "latest", deviceId] as const,
}

export function getLatestTelemetry(deviceId: string): Promise<LatestTelemetry> {
  return apiFetch<LatestTelemetry>({
    url: `/devices/${deviceId}/telemetry/latest`,
  })
}

export function latestTelemetryQueryOptions(deviceId: string) {
  return queryOptions({
    queryKey: telemetryKeys.latest(deviceId),
    queryFn: () => getLatestTelemetry(deviceId),
  })
}

export function useLatestTelemetry(deviceId: string) {
  return useQuery(latestTelemetryQueryOptions(deviceId))
}
