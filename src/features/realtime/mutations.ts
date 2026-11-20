import { apiFetch } from "@/lib/api/client"

import type { RealtimeTicket } from "./types"

export function createRealtimeTicket(): Promise<RealtimeTicket> {
  return apiFetch<RealtimeTicket>({
    method: "POST",
    url: "/realtime/ticket",
  })
}
