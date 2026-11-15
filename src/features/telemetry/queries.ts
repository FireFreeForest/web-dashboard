import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"

import { apiFetch, apiFetchList } from "@/lib/api/client"
import type { ApiListEnvelope } from "@/lib/api/types"

import type {
  EnvironmentTelemetry,
  FireTelemetry,
  LatestTelemetry,
  TelemetryListParams,
} from "./types"

export const telemetryKeys = {
  all: ["telemetry"] as const,
  latest: (deviceId: string) =>
    [...telemetryKeys.all, "latest", deviceId] as const,
  environment: (deviceId: string, params: TelemetryListParams = {}) =>
    [
      ...telemetryKeys.all,
      "environment",
      deviceId,
      params.page,
      params.per_page,
      params.from,
      params.to,
    ] as const,
  fire: (deviceId: string, params: TelemetryListParams = {}) =>
    [
      ...telemetryKeys.all,
      "fire",
      deviceId,
      params.page,
      params.per_page,
      params.from,
      params.to,
    ] as const,
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

export function getEnvironmentTelemetry(
  deviceId: string,
  params: TelemetryListParams = {}
): Promise<ApiListEnvelope<EnvironmentTelemetry>> {
  return apiFetchList<EnvironmentTelemetry>({
    url: `/devices/${deviceId}/telemetry/environment`,
    params,
  })
}

export function environmentTelemetryQueryOptions(
  deviceId: string,
  params: TelemetryListParams = {}
) {
  return queryOptions({
    queryKey: telemetryKeys.environment(deviceId, params),
    queryFn: () => getEnvironmentTelemetry(deviceId, params),
    placeholderData: keepPreviousData,
  })
}

export function useEnvironmentTelemetry(
  deviceId: string,
  params: TelemetryListParams = {}
) {
  return useQuery(environmentTelemetryQueryOptions(deviceId, params))
}

export function getFireTelemetry(
  deviceId: string,
  params: TelemetryListParams = {}
): Promise<ApiListEnvelope<FireTelemetry>> {
  return apiFetchList<FireTelemetry>({
    url: `/devices/${deviceId}/telemetry/fire`,
    params,
  })
}

export function fireTelemetryQueryOptions(
  deviceId: string,
  params: TelemetryListParams = {}
) {
  return queryOptions({
    queryKey: telemetryKeys.fire(deviceId, params),
    queryFn: () => getFireTelemetry(deviceId, params),
    placeholderData: keepPreviousData,
  })
}

export function useFireTelemetry(
  deviceId: string,
  params: TelemetryListParams = {}
) {
  return useQuery(fireTelemetryQueryOptions(deviceId, params))
}
