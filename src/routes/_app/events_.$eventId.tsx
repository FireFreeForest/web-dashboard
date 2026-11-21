import type { QueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { EventDetailPage } from "@/components/events/event-detail-page"
import { EVENT_TYPE_LABEL } from "@/components/events/event-ui"
import { eventDetailQueryOptions } from "@/features/events/queries"
import { pageTitle } from "@/lib/site"

type EventDetailLoaderContext = {
  params: { eventId: string }
  context: { queryClient: QueryClient }
}

type EventDetailHeadContext = {
  loaderData?: string | null
}

export const Route = createFileRoute("/_app/events_/$eventId")({
  staticData: { crumb: "Detail Event" },
  loader: async ({ params, context }: EventDetailLoaderContext) => {
    try {
      const event = await context.queryClient.ensureQueryData(
        eventDetailQueryOptions(params.eventId)
      )

      return EVENT_TYPE_LABEL[event.event_type]
    } catch {
      return null
    }
  },
  head: ({ loaderData }: EventDetailHeadContext) => ({
    meta: [{ title: pageTitle(loaderData ?? "Detail Event") }],
  }),
  component: EventDetailRoute,
})

function EventDetailRoute() {
  const { eventId } = Route.useParams()

  return <EventDetailPage eventId={eventId} />
}
