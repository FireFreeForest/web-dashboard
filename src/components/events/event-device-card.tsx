import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Clock01Icon,
  Location01Icon,
  RadioTowerIcon,
} from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

import { DeviceStatusPill } from "@/components/devices/device-ui"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { EventDetail } from "@/features/events/types"
import { formatRelativeTime } from "@/lib/utils"

export function EventDeviceCard({ event }: { event: EventDetail }) {
  const device = event.device

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device</CardTitle>
        {device ? (
          <CardAction>
            <Button
              size="xs"
              variant="ghost"
              render={
                <Link
                  to="/nodes/$deviceId"
                  params={{ deviceId: device.device_id }}
                />
              }
            >
              Buka
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </Button>
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        {device ? (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <HugeiconsIcon
                icon={RadioTowerIcon}
                strokeWidth={2}
                className="size-5 text-muted-foreground"
              />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {device.name || device.device_id}
                </span>
                <DeviceStatusPill status={device.status} />
              </div>
              <span className="font-mono text-xs tracking-wide text-muted-foreground">
                {device.device_id}
              </span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex min-w-0 items-center gap-1">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    strokeWidth={2}
                    className="size-3.5 shrink-0"
                  />
                  <span className="truncate">
                    {device.location_name || "-"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    strokeWidth={2}
                    className="size-3.5 shrink-0"
                  />
                  {formatRelativeTime(device.last_seen_at)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <Empty className="rounded-xl p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={RadioTowerIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>Device tidak tersedia</EmptyTitle>
              <EmptyDescription>
                Data device untuk event ini belum tersedia.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
