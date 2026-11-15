import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type { ApiError } from "@/lib/api/types"

import { deviceKeys } from "./queries"
import type { CreateDeviceInput, Device, UpdateDeviceInput } from "./types"

export function useCreateDevice() {
  const queryClient = useQueryClient()

  return useMutation<Device, ApiError, CreateDeviceInput>({
    mutationFn: async (input: CreateDeviceInput) =>
      apiFetch<Device>({
        method: "POST",
        url: "/devices",
        data: input,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: deviceKeys.lists() })
    },
  })
}

export function useUpdateDevice() {
  const queryClient = useQueryClient()

  return useMutation<
    Device,
    ApiError,
    { deviceId: string; input: UpdateDeviceInput }
  >({
    mutationFn: async ({ deviceId, input }) =>
      apiFetch<Device>({
        method: "PATCH",
        url: `/devices/${deviceId}`,
        data: input,
      }),
    onSuccess: (device) => {
      queryClient.setQueryData(deviceKeys.detail(device.device_id), device)
      void queryClient.invalidateQueries({ queryKey: deviceKeys.lists() })
    },
  })
}
