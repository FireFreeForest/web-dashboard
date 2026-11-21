import {
  keepPreviousData,
  queryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"

import { apiFetch, apiFetchList } from "@/lib/api/client"
import type { ApiListEnvelope } from "@/lib/api/types"

import type {
  Event,
  EventDetail,
  EventListParams,
  EventTimeline,
  EventTimelineParams,
} from "./types"

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
  timelines: (eventId: string) =>
    [...eventKeys.detail(eventId), "timeline"] as const,
  timeline: (eventId: string, include: EventTimelineParams["include"]) =>
    [...eventKeys.timelines(eventId), include ?? "all"] as const,
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

export function getEventDetail(eventId: string): Promise<EventDetail> {
  return apiFetch<EventDetail>({ url: `/events/${eventId}` })
}

export function eventDetailQueryOptions(eventId: string) {
  return queryOptions({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => getEventDetail(eventId),
  })
}

export function useEventDetail(eventId: string) {
  return useQuery(eventDetailQueryOptions(eventId))
}

export function getEventTimeline(
  eventId: string,
  params: EventTimelineParams = {}
): Promise<ApiListEnvelope<EventTimeline>> {
  return apiFetchList<EventTimeline>({
    url: `/events/${eventId}/timeline`,
    params,
  })
}

export function useEventTimeline(eventId: string, params: EventTimelineParams) {
  const include = params.include ?? "all"
  const perPage = params.per_page ?? 50

  return useInfiniteQuery({
    queryKey: eventKeys.timeline(eventId, include),
    queryFn: ({ pageParam }) =>
      getEventTimeline(eventId, {
        include,
        page: pageParam,
        per_page: perPage,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, per_page, total } = lastPage.meta
      return page * per_page < total ? page + 1 : undefined
    },
  })
}
