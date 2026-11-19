import { HugeiconsIcon } from "@hugeicons/react"

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
    <li
      className={cn(
        "flex items-center gap-3 py-2.5 first:pt-0 last:pb-0",
        className
      )}
    >
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
          <span className="truncate text-sm font-medium">
            {EVENT_TYPE_LABEL[event.event_type]}
          </span>
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
    </li>
  )
}
