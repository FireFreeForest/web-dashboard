import { HugeiconsIcon } from "@hugeicons/react"
import {
  Activity01Icon,
  AlarmSmokeIcon,
  FireIcon,
  SoilMoistureFieldIcon,
  ThermometerSunIcon,
  WifiDisconnected01Icon,
} from "@hugeicons/core-free-icons"

import {
  EVENT_TYPE_LABEL,
  SEVERITY_META,
  SeverityBadge,
} from "@/components/events/event-ui"
import type { Event, EventType } from "@/features/events/types"
import { cn, formatRelativeTime } from "@/lib/utils"

const EVENT_TYPE_ICON: Record<EventType, typeof FireIcon> = {
  FIRE_DETECTED: FireIcon,
  SMOKE_DETECTED: AlarmSmokeIcon,
  TEMPERATURE_HIGH: ThermometerSunIcon,
  SOIL_DRY: SoilMoistureFieldIcon,
  DEVICE_OFFLINE: WifiDisconnected01Icon,
  SENSOR_ERROR: Activity01Icon,
}

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
            {deviceLabel ?? "—"}
            <span aria-hidden className="mx-1.5">
              •
            </span>
            {formatRelativeTime(event.triggered_at)}
          </span>
        </div>
        <SeverityBadge severity={event.severity} className="shrink-0" />
      </div>
    </li>
  )
}
