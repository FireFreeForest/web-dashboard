import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"

import { apiFetch, apiFetchList } from "@/lib/api/client"
import type { ApiListEnvelope } from "@/lib/api/types"

import type { Device, DeviceListParams, DeviceStatusDetail } from "./types"

const ALL_DEVICES_PAGE_SIZE = 100

export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (params: DeviceListParams = {}) =>
    [...deviceKeys.lists(), params] as const,
  allList: () => [...deviceKeys.lists(), "all"] as const,
  details: () => [...deviceKeys.all, "detail"] as const,
  detail: (deviceId: string) => [...deviceKeys.details(), deviceId] as const,
  statuses: () => [...deviceKeys.all, "status"] as const,
  status: (deviceId: string) => [...deviceKeys.statuses(), deviceId] as const,
}

export function listDevices(
  params: DeviceListParams = {}
): Promise<ApiListEnvelope<Device>> {
  return apiFetchList<Device>({
    url: "/devices",
    params: {
      ...params,
      q: params.q || undefined,
    },
  })
}

export function devicesQueryOptions(params: DeviceListParams = {}) {
  return queryOptions({
    queryKey: deviceKeys.list(params),
    queryFn: () => listDevices(params),
    placeholderData: keepPreviousData,
  })
}

export function useDevices(params: DeviceListParams = {}) {
  return useQuery(devicesQueryOptions(params))
}

export async function listAllDevices(): Promise<Device[]> {
  const firstPage = await listDevices({
    page: 1,
    per_page: ALL_DEVICES_PAGE_SIZE,
  })
  const devices = [...firstPage.data]
  let page = firstPage.meta.page

  while (devices.length < firstPage.meta.total) {
    page += 1

    const nextPage = await listDevices({
      page,
      per_page: ALL_DEVICES_PAGE_SIZE,
    })

    if (nextPage.data.length === 0) {
      break
    }

    devices.push(...nextPage.data)
  }

  return devices
}

export function allDevicesQueryOptions() {
  return queryOptions({
    queryKey: deviceKeys.allList(),
    queryFn: listAllDevices,
  })
}

export function useAllDevices() {
  return useQuery(allDevicesQueryOptions())
}

export function useDeviceMap() {
  return useQuery({
    ...allDevicesQueryOptions(),
    select: (devices) => new Map(devices.map((device) => [device.id, device])),
  })
}

export function getDevice(deviceId: string): Promise<Device> {
  return apiFetch<Device>({ url: `/devices/${deviceId}` })
}

export function deviceQueryOptions(deviceId: string) {
  return queryOptions({
    queryKey: deviceKeys.detail(deviceId),
    queryFn: () => getDevice(deviceId),
  })
}

export function useDevice(deviceId: string) {
  return useQuery(deviceQueryOptions(deviceId))
}

export function getDeviceStatus(deviceId: string): Promise<DeviceStatusDetail> {
  return apiFetch<DeviceStatusDetail>({
    url: `/devices/${deviceId}/status`,
  })
}

export function deviceStatusQueryOptions(deviceId: string) {
  return queryOptions({
    queryKey: deviceKeys.status(deviceId),
    queryFn: () => getDeviceStatus(deviceId),
  })
}

export function useDeviceStatus(deviceId: string) {
  return useQuery(deviceStatusQueryOptions(deviceId))
}
