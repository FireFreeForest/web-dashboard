import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

import {
  EVENT_TYPE_LABEL,
  SeverityBadge,
} from "@/components/events/event-ui"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useEvents } from "@/features/events/queries"
import { formatRelativeTime } from "@/lib/utils"

export function NodeActivityCard({ deviceId }: { deviceId: string }) {
  const query = useEvents({ device_id: deviceId, per_page: 5 })
  const events = query.data?.data ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardAction>
          <Button size="xs" variant="ghost" render={<Link to="/events" />}>
            View All
            <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="flex flex-col items-center gap-2 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {query.error.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
            >
              <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
              Coba lagi
            </Button>
          </div>
        ) : events.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            Belum ada aktivitas.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-sm font-medium">
                    {EVENT_TYPE_LABEL[event.event_type]}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {event.message}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <SeverityBadge severity={event.severity} />
                  <span className="text-[11px] text-muted-foreground">
                    {formatRelativeTime(event.triggered_at)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
