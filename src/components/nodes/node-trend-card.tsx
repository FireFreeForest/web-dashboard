import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  RefreshIcon,
  TimelineEventIcon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

import { NodeCustomRangeDialog } from "./node-custom-range-dialog"
import {
  TREND_RANGES,
  type CustomTrendRange,
  type TrendRange,
  type TrendSelection,
} from "./node-trends-data"

export function NodeTrendCard({
  title,
  description,
  selection,
  onPresetChange,
  onCustomChange,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  isEmpty,
  children,
}: {
  title: string
  description?: string
  selection: TrendSelection
  onPresetChange: (range: TrendRange) => void
  onCustomChange: (range: CustomTrendRange) => void
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  isEmpty: boolean
  children: React.ReactNode
}) {
  const [customOpen, setCustomOpen] = useState(false)

  const customValue = useMemo(
    () =>
      selection.kind === "custom"
        ? { from: selection.from, to: selection.to }
        : null,
    [selection]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <CardDescription>{description}</CardDescription>
        ) : null}
        <CardAction>
          <ToggleGroup
            value={[selection.kind === "custom" ? "CUSTOM" : selection.range]}
            onValueChange={(next) => {
              const value = next[0]
              if (!value) {
                if (selection.kind === "custom") setCustomOpen(true)
                return
              }

              if (value === "CUSTOM") {
                setCustomOpen(true)
                return
              }

              onPresetChange(value as TrendRange)
            }}
            variant="outline"
            size="sm"
            spacing={0}
          >
            {TREND_RANGES.map((option) => (
              <ToggleGroupItem key={option.value} value={option.value}>
                {option.label}
              </ToggleGroupItem>
            ))}
            <ToggleGroupItem
              value="CUSTOM"
              aria-label="Rentang waktu kustom"
            >
              <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} />
            </ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : isError ? (
          <div className="flex flex-col items-center gap-2 rounded-xl p-6 text-center ring-1 ring-foreground/10">
            <p className="text-sm text-muted-foreground">
              {errorMessage ?? "Gagal memuat data."}
            </p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
              Coba lagi
            </Button>
          </div>
        ) : isEmpty ? (
          <Empty className="rounded-xl p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={TimelineEventIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>Belum ada data</EmptyTitle>
              <EmptyDescription>
                Data tren belum tersedia untuk rentang ini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          children
        )}
      </CardContent>
      <NodeCustomRangeDialog
        open={customOpen}
        onOpenChange={setCustomOpen}
        value={customValue}
        onApply={onCustomChange}
      />
    </Card>
  )
}
