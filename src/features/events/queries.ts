import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"

import { apiFetch, apiFetchList } from "@/lib/api/client"
import type { ApiListEnvelope } from "@/lib/api/types"

import type { Event, EventListParams } from "./types"

export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (params: EventListParams = {}) =>
    [
      ...eventKeys.lists(),
      params.page,
      params.per_page,
      params.severity,
      params.status,
      params.event_type,
      params.device_id,
      params.from,
      params.to,
    ] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (eventId: string) => [...eventKeys.details(), eventId] as const,
}

export function getEvents(
  params: EventListParams = {}
): Promise<ApiListEnvelope<Event>> {
  return apiFetchList<Event>({
    url: "/events",
    params,
  })
}

export function eventsQueryOptions(params: EventListParams = {}) {
  return queryOptions({
    queryKey: eventKeys.list(params),
    queryFn: () => getEvents(params),
    placeholderData: keepPreviousData,
  })
}

export function useEvents(params: EventListParams = {}) {
  return useQuery(eventsQueryOptions(params))
}

export function getEvent(eventId: string): Promise<Event> {
  return apiFetch<Event>({ url: `/events/${eventId}` })
}

export function eventQueryOptions(eventId: string) {
  return queryOptions({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => getEvent(eventId),
  })
}

export function useEvent(eventId: string) {
  return useQuery(eventQueryOptions(eventId))
}
