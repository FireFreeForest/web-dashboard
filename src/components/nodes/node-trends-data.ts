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

export type EnvironmentTrendPoint = {
  time: number
  temperature: number
  humidity: number
  soil: number
}

export type FireTrendPoint = {
  time: number
  flame: number
  smoke: number
}

export function getRangeStart(range: TrendRange): Date {
  return new Date(Date.now() - RANGE_MS[range])
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

function round(value: number, digits = 1): number {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function createTimeline(range: TrendRange, points = 24): number[] {
  const end = Date.now()
  const step = RANGE_MS[range] / (points - 1)

  return Array.from({ length: points }, (_, index) => end - step * (points - 1 - index))
}

export function createDummyEnvironmentTrend(
  range: TrendRange
): EnvironmentTrendPoint[] {
  return createTimeline(range).map((time, index) => {
    const phase = index / 2.5
    return {
      time,
      temperature: round(31 + Math.sin(phase) * 3 + Math.cos(phase / 2) * 1.5),
      humidity: round(66 + Math.sin(phase / 1.4) * 9),
      soil: round(42 + Math.cos(phase / 2) * 12),
    }
  })
}

export function createDummyFireTrend(range: TrendRange): FireTrendPoint[] {
  return createTimeline(range).map((time, index) => {
    const phase = index / 2
    const spike = index > 15 && index < 19 ? 35 : 0
    return {
      time,
      flame: Math.round(12 + Math.max(0, Math.sin(phase)) * 18 + spike),
      smoke: Math.round(18 + Math.max(0, Math.cos(phase / 1.6)) * 22 + spike),
    }
  })
}
