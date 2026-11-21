import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "@tanstack/react-router"

import {
  EVENT_TYPE_ICON,
  EVENT_TYPE_LABEL,
  SEVERITY_META,
  StatusBadge,
} from "@/components/events/event-ui"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import type { EventDetail } from "@/features/events/types"
import { cn, formatRelativeTime } from "@/lib/utils"

export function EventDetailHeader({
  event,
  actions,
}: {
  event: EventDetail
  actions?: React.ReactNode
}) {
  const severity = SEVERITY_META[event.severity]

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/events" />}>
              Events
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {EVENT_TYPE_LABEL[event.event_type]}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              severity.iconClassName
            )}
          >
            <HugeiconsIcon
              icon={EVENT_TYPE_ICON[event.event_type]}
              strokeWidth={2}
              className="size-6"
            />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate font-heading text-2xl font-semibold tracking-tight">
                {EVENT_TYPE_LABEL[event.event_type]}
              </h1>
              <StatusBadge status={event.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              Dipicu {formatRelativeTime(event.triggered_at)}
            </p>
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  )
}
