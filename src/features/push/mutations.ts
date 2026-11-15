import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type { ApiError } from "@/lib/api/types"

import type { RegisterPushTokenInput } from "./types"

export function useRegisterPushToken() {
  return useMutation<void, ApiError, RegisterPushTokenInput>({
    mutationFn: (input) =>
      apiFetch<void>({
        method: "POST",
        url: "/push/tokens",
        data: input,
      }),
  })
}
