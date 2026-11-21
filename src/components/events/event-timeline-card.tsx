import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ComputerIcon,
  TimelineEventIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"

import {
  TIMELINE_KIND_ICON,
  TIMELINE_LEVEL_META,
} from "@/components/events/event-ui"
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
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useEventTimeline } from "@/features/events/queries"
import type { EventTimeline, TimelineInclude } from "@/features/events/types"
import { cn, formatDateTime } from "@/lib/utils"

const TIMELINE_INCLUDE_OPTIONS: Array<{
  value: TimelineInclude
  label: string
}> = [
  { value: "important", label: "Penting" },
  { value: "all", label: "Semua" },
]

function TimelineItem({ entry }: { entry: EventTimeline }) {
  const meta = TIMELINE_LEVEL_META[entry.level]

  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          meta.iconClassName
        )}
      >
        <HugeiconsIcon
          icon={TIMELINE_KIND_ICON[entry.kind]}
          strokeWidth={2}
          className="size-4.5"
        />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0 truncate text-sm font-medium">
            {entry.title}
          </span>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {formatDateTime(entry.occurred_at)}
          </span>
        </div>
        {entry.description ? (
          <p className="text-sm text-muted-foreground">{entry.description}</p>
        ) : null}
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <HugeiconsIcon
            icon={entry.actor.type === "user" ? UserIcon : ComputerIcon}
            strokeWidth={2}
            className="size-3.5 shrink-0"
          />
          {entry.actor.name}
        </span>
      </div>
    </li>
  )
}

export function EventTimelineCard({ eventId }: { eventId: string }) {
  const [include, setInclude] = useState<TimelineInclude>("important")
  const query = useEventTimeline(eventId, { include })
  const entries = query.data?.pages.flatMap((page) => page.data) ?? []
  const total = query.data?.pages[0]?.meta.total ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Linimasa</CardTitle>
        <CardAction>
          <ToggleGroup
            value={[include]}
            onValueChange={(next) => {
              const value = next[0] as TimelineInclude | undefined
              if (value) setInclude(value)
            }}
            variant="outline"
            size="sm"
            spacing={0}
          >
            {TIMELINE_INCLUDE_OPTIONS.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {query.isPending ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : query.isError ? (
          <div className="flex flex-col items-center gap-2 rounded-xl p-6 text-center ring-1 ring-foreground/10">
            <p className="text-sm text-muted-foreground">
              {query.error.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void query.refetch()}
            >
              Coba lagi
            </Button>
          </div>
        ) : entries.length === 0 ? (
          <Empty className="rounded-xl p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={TimelineEventIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>Belum ada linimasa</EmptyTitle>
              <EmptyDescription>
                Belum ada riwayat untuk event ini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <ul className="flex flex-col divide-y divide-border">
              {entries.map((entry) => (
                <TimelineItem key={entry.id} entry={entry} />
              ))}
            </ul>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {entries.length} dari {total} entri
              </span>
              {query.hasNextPage ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void query.fetchNextPage()}
                  disabled={query.isFetchingNextPage}
                >
                  {query.isFetchingNextPage ? "Memuat..." : "Muat lebih banyak"}
                </Button>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
