import { formatShortDate, formatShortTime } from "@/lib/utils"

export type TrendRange = "1H" | "6H" | "24H" | "7D"

export const TREND_RANGES: Array<{ value: TrendRange; label: string }> = [
  { value: "1H", label: "1 jam" },
  { value: "6H", label: "6 jam" },
  { value: "24H", label: "24 jam" },
  { value: "7D", label: "7 hari" },
]

const RANGE_MS: Record<TrendRange, number> = {
  "1H": 60 * 60 * 1000,
  "6H": 6 * 60 * 60 * 1000,
  "24H": 24 * 60 * 60 * 1000,
  "7D": 7 * 24 * 60 * 60 * 1000,
}

export const RANGE_INTERVAL_MINUTES: Record<TrendRange, number> = {
  "1H": 1,
  "6H": 5,
  "24H": 15,
  "7D": 60,
}

export type EnvironmentTrendPoint = {
  time: number
  temperature: number | null
  humidity: number | null
  soil: number
}

export type FireTrendPoint = {
  time: number
  flame: number | null
  smoke: number
}

export type WaterPumpTrendPoint = {
  time: number
  pump: number
}

export function getTrendWindow(range: TrendRange): {
  from: string
  to: string
} {
  const to = Date.now()

  return {
    from: new Date(to - RANGE_MS[range]).toISOString(),
    to: new Date(to).toISOString(),
  }
}

export function formatTrendTime(
  value: number | null | undefined,
  range: TrendRange
): string {
  if (value == null) return "—"

  return range === "7D" ? formatShortDate(value) : formatShortTime(value)
}

export function formatTrendTooltipLabel(
  payload: ReadonlyArray<{ payload?: { time?: number } }>,
  range: TrendRange
): string {
  return formatTrendTime(payload[0]?.payload?.time, range)
}
