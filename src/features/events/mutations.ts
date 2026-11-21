import { useMutation, useQueryClient } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"
import type { ApiError } from "@/lib/api/types"

import { eventKeys } from "./queries"
import type { Event, EventDetail } from "./types"

function useEventAction(path: "acknowledge" | "resolve") {
  const queryClient = useQueryClient()

  return useMutation<Event, ApiError, string>({
    mutationFn: (eventId) =>
      apiFetch<Event>({
        method: "POST",
        url: `/events/${eventId}/${path}`,
      }),
    onSuccess: (event) => {
      queryClient.setQueryData<EventDetail>(
        eventKeys.detail(event.id),
        (current) => (current ? { ...current, ...event } : current)
      )
      void queryClient.invalidateQueries({
        queryKey: eventKeys.detail(event.id),
      })
      void queryClient.invalidateQueries({ queryKey: eventKeys.lists() })
      void queryClient.invalidateQueries({
        queryKey: eventKeys.timelines(event.id),
      })
    },
  })
}

export function useAcknowledgeEvent() {
  return useEventAction("acknowledge")
}

export function useResolveEvent() {
  return useEventAction("resolve")
}
