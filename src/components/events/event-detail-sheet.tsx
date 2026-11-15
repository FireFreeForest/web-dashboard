import { HugeiconsIcon } from "@hugeicons/react"
import { TimelineEventIcon } from "@hugeicons/core-free-icons"

import {
  EVENT_TYPE_LABEL,
  formatTimestamp,
  SeverityBadge,
  StatusBadge,
} from "@/components/events/event-ui"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useEvent } from "@/features/events/queries"
import type { Event } from "@/features/events/types"

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium break-all">{value}</span>
    </div>
  )
}

function EventDetailContent({ event }: { event: Event }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pb-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <HugeiconsIcon
            icon={TimelineEventIcon}
            strokeWidth={2}
            className="size-5 text-muted-foreground"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-heading text-base font-semibold">
            {EVENT_TYPE_LABEL[event.event_type]}
          </p>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={event.severity} />
            <StatusBadge status={event.status} />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DetailRow label="Pesan" value={event.message} />
        <DetailRow label="Source" value={event.source || "—"} />
        <DetailRow label="Device" value={event.device_id} />
        <DetailRow label="Dibuat" value={formatTimestamp(event.created_at)} />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-muted-foreground">Timeline</p>
        <DetailRow
          label="Triggered"
          value={formatTimestamp(event.triggered_at)}
        />
        <DetailRow
          label="Acknowledged"
          value={
            event.acknowledged_at ? formatTimestamp(event.acknowledged_at) : "—"
          }
        />
        <DetailRow
          label="Resolved"
          value={event.resolved_at ? formatTimestamp(event.resolved_at) : "—"}
        />
      </div>

      {event.metadata ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Metadata</p>
          <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            {JSON.stringify(event.metadata, null, 2)}
          </pre>
        </div>
      ) : null}
    </div>
  )
}

function EventDetail({ eventId }: { eventId: string }) {
  const { data: event, isPending, isError, error, refetch } = useEvent(eventId)

  if (isPending) {
    return (
      <div className="flex flex-col gap-3 px-6 pb-6">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 pb-6">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={TimelineEventIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Gagal memuat detail</EmptyTitle>
            <EmptyDescription>{error?.message}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return <EventDetailContent event={event} />
}

export function EventDetailSheet({
  eventId,
  open,
  onOpenChange,
}: {
  eventId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detail Event</SheetTitle>
          <SheetDescription>Informasi lengkap event.</SheetDescription>
        </SheetHeader>
        {eventId ? <EventDetail eventId={eventId} /> : null}
      </SheetContent>
    </Sheet>
  )
}
