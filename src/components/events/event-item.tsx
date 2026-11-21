import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"

import {
  EVENT_TYPE_ICON,
  EVENT_TYPE_LABEL,
  SEVERITY_META,
  SeverityBadge,
} from "@/components/events/event-ui"
import type { Event } from "@/features/events/types"
import { cn, formatRelativeTime } from "@/lib/utils"

export function EventItem({
  event,
  deviceLabel,
  className,
}: {
  event: Event
  deviceLabel?: string
  className?: string
}) {
  const meta = SEVERITY_META[event.severity]

  return (
    <li className="py-2.5 first:pt-0 last:pb-0">
      <div className={cn("flex items-center gap-3", className)}>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            meta.iconClassName
          )}
        >
          <HugeiconsIcon
            icon={EVENT_TYPE_ICON[event.event_type]}
            strokeWidth={2}
            className="size-4.5"
          />
        </span>
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <Link
              to="/events/$eventId"
              params={{ eventId: event.id }}
              className="truncate rounded text-sm font-medium hover:underline focus-visible:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              {EVENT_TYPE_LABEL[event.event_type]}
            </Link>
            <span className="truncate text-xs text-muted-foreground">
              {deviceLabel ? (
                <>
                  {deviceLabel}
                  <span aria-hidden className="mx-1.5">
                    •
                  </span>
                </>
              ) : null}
              {formatRelativeTime(event.triggered_at)}
            </span>
          </div>
          <SeverityBadge severity={event.severity} className="shrink-0" />
        </div>
      </div>
    </li>
  )
}
