import { createFileRoute } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { TimelineEventIcon } from "@hugeicons/core-free-icons"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const Route = createFileRoute("/_app/events")({
  staticData: { crumb: "Events" },
  component: EventsPage,
})

function EventsPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={TimelineEventIcon} strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle>No events yet</EmptyTitle>
          <EmptyDescription>
            Alerts and activity from your nodes will show up here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
