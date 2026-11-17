export type TrendRange = "1H" | "6H" | "24H" | "7D"

export const TREND_RANGES: Array<{ value: TrendRange; label: string }> = [
  { value: "1H", label: "1H" },
  { value: "6H", label: "6H" },
  { value: "24H", label: "24H" },
  { value: "7D", label: "7D" },
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

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
})

export function formatTrendTime(
  value: number | null | undefined,
  range: TrendRange
): string {
  if (value == null) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return range === "7D"
    ? dateFormatter.format(date)
    : timeFormatter.format(date)
}

export function formatTrendTooltipLabel(
  payload: ReadonlyArray<{ payload?: { time?: number } }>,
  range: TrendRange
): string {
  return formatTrendTime(payload[0]?.payload?.time, range)
}
