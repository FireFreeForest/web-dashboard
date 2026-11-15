import { HugeiconsIcon } from "@hugeicons/react"
import { TimelineEventIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useAcknowledgeEvent,
  useResolveEvent,
} from "@/features/events/mutations"
import { useEvent } from "@/features/events/queries"
import type { Event } from "@/features/events/types"
import { ApiError } from "@/lib/api/types"

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium break-all">{value}</span>
    </div>
  )
}

function EventDetailContent({
  event,
  canAcknowledge,
  canResolve,
}: {
  event: Event
  canAcknowledge: boolean
  canResolve: boolean
}) {
  const acknowledge = useAcknowledgeEvent()
  const resolve = useResolveEvent()

  const handleAcknowledge = async () => {
    try {
      await acknowledge.mutateAsync(event.id)
      toast.success("Event di-acknowledge.")
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Terjadi kesalahan."
      )
    }
  }

  const handleResolve = async () => {
    try {
      await resolve.mutateAsync(event.id)
      toast.success("Event di-resolve.")
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Terjadi kesalahan."
      )
    }
  }

  const canAcknowledgeNow = canAcknowledge && event.status === "active"
  const canResolveNow = canResolve && event.status !== "resolved"
  const showFooter = canAcknowledgeNow || canResolveNow

  return (
    <>
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
              event.acknowledged_at
                ? formatTimestamp(event.acknowledged_at)
                : "—"
            }
          />
          <DetailRow
            label="Resolved"
            value={event.resolved_at ? formatTimestamp(event.resolved_at) : "—"}
          />
        </div>

        {event.metadata ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Metadata
            </p>
            <pre className="overflow-x-auto rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </div>
        ) : null}
      </div>

      {showFooter ? (
        <SheetFooter className="flex-row">
          {canAcknowledgeNow ? (
            <Button
              className="flex-1"
              onClick={handleAcknowledge}
              disabled={acknowledge.isPending}
            >
              {acknowledge.isPending ? "Memproses..." : "Acknowledge"}
            </Button>
          ) : null}
          {canResolveNow ? (
            <Button
              className="flex-1"
              variant="outline"
              onClick={handleResolve}
              disabled={resolve.isPending}
            >
              {resolve.isPending ? "Memproses..." : "Resolve"}
            </Button>
          ) : null}
        </SheetFooter>
      ) : null}
    </>
  )
}

function EventDetail({
  eventId,
  canAcknowledge,
  canResolve,
}: {
  eventId: string
  canAcknowledge: boolean
  canResolve: boolean
}) {
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

  return (
    <EventDetailContent
      event={event}
      canAcknowledge={canAcknowledge}
      canResolve={canResolve}
    />
  )
}

export function EventDetailSheet({
  eventId,
  open,
  onOpenChange,
  canAcknowledge,
  canResolve,
}: {
  eventId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canAcknowledge: boolean
  canResolve: boolean
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detail Event</SheetTitle>
          <SheetDescription>Informasi lengkap event.</SheetDescription>
        </SheetHeader>
        {eventId ? (
          <EventDetail
            eventId={eventId}
            canAcknowledge={canAcknowledge}
            canResolve={canResolve}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
