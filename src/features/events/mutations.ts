import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type { ApiError } from "@/lib/api/types"

import { eventKeys } from "./queries"
import type { Event } from "./types"

export function useAcknowledgeEvent() {
  const queryClient = useQueryClient()

  return useMutation<Event, ApiError, string>({
    mutationFn: (eventId) =>
      apiFetch<Event>({
        method: "POST",
        url: `/events/${eventId}/acknowledge`,
      }),
    onSuccess: (event) => {
      queryClient.setQueryData(eventKeys.detail(event.id), event)
      void queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
    },
  })
}
