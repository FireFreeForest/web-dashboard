import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"

import { apiFetchList } from "@/lib/api/client"
import type { ApiListEnvelope } from "@/lib/api/types"

import type { Command, CommandListParams } from "./types"

export const commandKeys = {
  all: ["commands"] as const,
  lists: (deviceId: string) => [...commandKeys.all, "list", deviceId] as const,
  list: (deviceId: string, params: CommandListParams = {}) =>
    [...commandKeys.lists(deviceId), params.page, params.per_page] as const,
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

const COMMAND_STATUS_POLL_INTERVAL_MS = 5_000

function hasInFlightCommand(
  data: ApiListEnvelope<Command> | undefined
): boolean {
  if (!data) return false

  return data.data.some(
    (command) => command.status === "pending" || command.status === "sent"
  )
}

export function deviceCommandsQueryOptions(
  deviceId: string,
  params: CommandListParams = {}
) {
  return queryOptions({
    queryKey: commandKeys.list(deviceId, params),
    queryFn: () => getDeviceCommands(deviceId, params),
    placeholderData: keepPreviousData,
    refetchInterval: (query) =>
      hasInFlightCommand(query.state.data)
        ? COMMAND_STATUS_POLL_INTERVAL_MS
        : false,
  })
}

export function useDeviceCommands(
  deviceId: string,
  params: CommandListParams = {}
) {
  return useQuery(deviceCommandsQueryOptions(deviceId, params))
}
