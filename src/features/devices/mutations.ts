import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type { ApiError } from "@/lib/api/types"

import { deviceKeys } from "./queries"
import type { CreateDeviceInput, Device } from "./types"

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
