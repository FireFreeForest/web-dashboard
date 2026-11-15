import { queryOptions, useQuery } from "@tanstack/react-query"

import { apiFetchList } from "@/lib/api/client"
import type { ListEnvelope } from "@/lib/api/types"

import type { Device, DeviceListParams } from "./types"

export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (params: DeviceListParams = {}) =>
    [...deviceKeys.lists(), params] as const,
  details: () => [...deviceKeys.all, "detail"] as const,
  detail: (deviceId: string) => [...deviceKeys.details(), deviceId] as const,
}

export function listDevices(
  params: DeviceListParams = {}
): Promise<ListEnvelope<Device>> {
  return apiFetchList<Device>({
    url: "/devices",
    params,
  })
}

export function devicesQueryOptions(params: DeviceListParams = {}) {
  return queryOptions({
    queryKey: deviceKeys.list(params),
    queryFn: () => listDevices(params),
  })
}

export function useDevices(params: DeviceListParams = {}) {
  return useQuery(devicesQueryOptions(params))
}
