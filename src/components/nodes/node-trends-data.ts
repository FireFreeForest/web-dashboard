import {
  formatShortDate,
  formatShortTime,
  formatShortTimeWithSeconds,
} from "@/lib/utils"

export type TrendRange = "1H" | "6H" | "24H" | "7D"

export type CustomTrendRange = {
  from: Date
  to: Date
}

export type TrendSelection =
  | { kind: "preset"; range: TrendRange }
  | ({ kind: "custom" } & CustomTrendRange)

export const TREND_RANGES: Array<{ value: TrendRange; label: string }> = [
  { value: "1H", label: "1 jam" },
  { value: "6H", label: "6 jam" },
  { value: "24H", label: "24 jam" },
  { value: "7D", label: "7 hari" },
]

export const MAX_CUSTOM_RANGE_DAYS = 30

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

const RANGE_MS: Record<TrendRange, number> = {
  "1H": HOUR_MS,
  "6H": 6 * HOUR_MS,
  "24H": DAY_MS,
  "7D": 7 * DAY_MS,
}

export const RANGE_INTERVAL_MINUTES: Record<TrendRange, number> = {
  "1H": 0,
  "6H": 5,
  "24H": 15,
  "7D": 60,
}

const MAX_INTERVAL_MINUTES = 1440
const MAX_BUCKETS = 5000

export function getTrendSpanMs(selection: TrendSelection): number {
  if (selection.kind === "custom") {
    return Math.max(0, selection.to.getTime() - selection.from.getTime())
  }

  return RANGE_MS[selection.range]
}

export function getCustomInterval(from: Date, to: Date): number {
  const minutes = Math.max(1, (to.getTime() - from.getTime()) / 60_000)

  if (minutes <= 60) return 0

  let interval: number
  if (minutes <= 6 * 60) {
    interval = 5
  } else if (minutes <= 24 * 60) {
    interval = 15
  } else {
    interval = 60
  }

  const minForBuckets = Math.ceil(minutes / MAX_BUCKETS)

  return Math.min(MAX_INTERVAL_MINUTES, Math.max(interval, minForBuckets))
}

export function getTrendInterval(selection: TrendSelection): number {
  if (selection.kind === "custom") {
    return getCustomInterval(selection.from, selection.to)
  }

  return RANGE_INTERVAL_MINUTES[selection.range]
}

export function getTrendWindow(
  selection: TrendSelection,
  now: number = Date.now()
): {
  from: string
  to: string
} {
  if (selection.kind === "custom") {
    return {
      from: selection.from.toISOString(),
      to: selection.to.toISOString(),
    }
  }

  return {
    from: new Date(now - RANGE_MS[selection.range]).toISOString(),
    to: new Date(now).toISOString(),
  }
}

export function formatTrendTime(
  value: number | null | undefined,
  selection: TrendSelection
): string {
  if (value == null) return "-"

  return getTrendSpanMs(selection) <= DAY_MS
    ? formatShortTime(value)
    : formatShortDate(value)
}

export function formatTrendTooltipLabel(
  payload: ReadonlyArray<{ payload?: { time?: number } }>,
  selection: TrendSelection
): string {
  const time = payload[0]?.payload?.time

  if (time == null) return "-"

  return getTrendSpanMs(selection) <= HOUR_MS
    ? formatShortTimeWithSeconds(time)
    : formatTrendTime(time, selection)
}
