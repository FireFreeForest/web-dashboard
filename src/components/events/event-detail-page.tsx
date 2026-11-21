import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

import { EventActions } from "@/components/events/event-actions"
import { EventDetailHeader } from "@/components/events/event-detail-header"
import { EventDeviceCard } from "@/components/events/event-device-card"
import { EventInfoCard } from "@/components/events/event-info-card"
import { EventMetadataCard } from "@/components/events/event-metadata-card"
import { EventTimelineCard } from "@/components/events/event-timeline-card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useEventDetail } from "@/features/events/queries"
import { ApiError } from "@/lib/api/types"

const EMPTY_HEADER_ICON = Alert02Icon

function EventDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

export function EventDetailPage({ eventId }: { eventId: string }) {
  const query = useEventDetail(eventId)

  if (query.isPending) {
    return <EventDetailSkeleton />
  }

  if (query.isError || !query.data) {
    const isNotFound =
      query.error instanceof ApiError && query.error.status === 404

    return (
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={EMPTY_HEADER_ICON} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>
              {isNotFound ? "Event tidak ditemukan" : "Gagal memuat Event"}
            </EmptyTitle>
            <EmptyDescription>
              {isNotFound
                ? "Event dengan ID tersebut tidak tersedia."
                : query.error?.message}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" onClick={() => void query.refetch()}>
                <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
                Coba lagi
              </Button>
              <Button render={<Link to="/events" />}>Kembali ke Events</Button>
            </div>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  const event = query.data

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <EventDetailHeader
        event={event}
        actions={
          <EventActions event={event} onRefresh={() => void query.refetch()} />
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <EventInfoCard event={event} />
          <EventTimelineCard eventId={event.id} />
        </div>
        <div className="flex flex-col gap-4">
          <EventDeviceCard event={event} />
          <EventMetadataCard event={event} />
        </div>
      </div>
    </div>
  )
}
