import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"

import { apiFetchList } from "@/lib/api/client"
import type { ApiListEnvelope } from "@/lib/api/types"

import type { Command, CommandListParams } from "./types"

export const commandKeys = {
  all: ["commands"] as const,
  list: (deviceId: string, params: CommandListParams = {}) =>
    [
      ...commandKeys.all,
      "list",
      deviceId,
      params.page,
      params.per_page,
    ] as const,
}

export function getDeviceCommands(
  deviceId: string,
  params: CommandListParams = {}
): Promise<ApiListEnvelope<Command>> {
  return apiFetchList<Command>({
    url: `/devices/${deviceId}/commands`,
    params,
  })
}

export function deviceCommandsQueryOptions(
  deviceId: string,
  params: CommandListParams = {}
) {
  return queryOptions({
    queryKey: commandKeys.list(deviceId, params),
    queryFn: () => getDeviceCommands(deviceId, params),
    placeholderData: keepPreviousData,
  })
}

export function useDeviceCommands(
  deviceId: string,
  params: CommandListParams = {}
) {
  return useQuery(deviceCommandsQueryOptions(deviceId, params))
}
