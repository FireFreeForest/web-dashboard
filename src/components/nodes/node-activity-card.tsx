import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Link } from "@tanstack/react-router"

import { EventItem } from "@/components/events/event-item"
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

export function NodeActivityCard({ deviceId }: { deviceId: string }) {
  const query = useEvents({ device_id: deviceId, per_page: 5 })
  const events = query.data?.data ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
        <CardAction>
          <Button size="xs" variant="ghost" render={<Link to="/events" />}>
            Lihat Semua
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
              <EventItem key={event.id} event={event} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
