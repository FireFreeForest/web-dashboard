import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Calendar03Icon,
  Clock01Icon,
  MessageMultiple01Icon,
  RadioTowerIcon,
  SourceCodeIcon,
  Tick02Icon,
  TaskDone01Icon,
} from "@hugeicons/core-free-icons"

import {
  EVENT_TYPE_LABEL,
  SeverityBadge,
  StatusBadge,
} from "@/components/events/event-ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { resolveEventSourceLabel } from "@/features/events/source"
import type { EventDetail } from "@/features/events/types"
import { formatDateTime } from "@/lib/utils"

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: IconSvgElement
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-muted-foreground">
        <HugeiconsIcon icon={icon} strokeWidth={2} className="size-4" />
        {label}
      </span>
      <span className="flex items-center gap-2 text-right font-medium break-words">
        {children}
      </span>
    </div>
  )
}

export function EventInfoCard({ event }: { event: EventDetail }) {
  const sourceLabel = resolveEventSourceLabel(event.source)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Event</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <DetailRow icon={MessageMultiple01Icon} label="Pesan">
          <span className="break-words">{event.message}</span>
        </DetailRow>
        <Separator />
        <DetailRow icon={SourceCodeIcon} label="Sumber">
          {sourceLabel ? (
            <span>{sourceLabel}</span>
          ) : event.source ? (
            <span className="font-mono text-xs">{event.source}</span>
          ) : (
            <span>{EVENT_TYPE_LABEL[event.event_type]}</span>
          )}
        </DetailRow>
        <Separator />
        <DetailRow icon={RadioTowerIcon} label="Keparahan">
          <SeverityBadge severity={event.severity} />
        </DetailRow>
        <Separator />
        <DetailRow icon={TaskDone01Icon} label="Status">
          <StatusBadge status={event.status} />
        </DetailRow>
        <Separator />
        <DetailRow icon={Clock01Icon} label="Dipicu">
          <span className="tabular-nums">
            {formatDateTime(event.triggered_at)}
          </span>
        </DetailRow>
        <Separator />
        <DetailRow icon={Calendar03Icon} label="Dibuat">
          <span className="tabular-nums">
            {formatDateTime(event.created_at)}
          </span>
        </DetailRow>
        <Separator />
        <DetailRow icon={Tick02Icon} label="Dikonfirmasi">
          <span className="tabular-nums">
            {event.acknowledged_at
              ? formatDateTime(event.acknowledged_at)
              : "-"}
          </span>
        </DetailRow>
        <Separator />
        <DetailRow icon={TaskDone01Icon} label="Diselesaikan">
          <span className="tabular-nums">
            {event.resolved_at ? formatDateTime(event.resolved_at) : "-"}
          </span>
        </DetailRow>
      </CardContent>
    </Card>
  )
}
