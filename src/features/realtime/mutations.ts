import { useMutation } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type { ApiError } from "@/lib/api/types"

import type { RealtimeTicket } from "./types"

export function createRealtimeTicket(): Promise<RealtimeTicket> {
  return apiFetch<RealtimeTicket>({
    method: "POST",
    url: "/realtime/ticket",
  })
}

export function useCreateRealtimeTicket() {
  return useMutation<RealtimeTicket, ApiError, void>({
    mutationFn: createRealtimeTicket,
  })
}
