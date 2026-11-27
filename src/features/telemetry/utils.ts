export const ADC_MAX = 1024

export function adcToPercent(value: number): number {
  return Math.round((Math.min(Math.max(value, 0), ADC_MAX) / ADC_MAX) * 100)
}

export function adcToInvertedPercent(value: number): number {
  return 100 - adcToPercent(value)
}

type SeriesTimeRow = {
  bucket_start?: string
  recorded_at?: string
}

export function seriesPointTime(row: SeriesTimeRow): number {
  const value = row.bucket_start ?? row.recorded_at
  return value ? Date.parse(value) : Number.NaN
}

type SeriesPumpRow = {
  pump_on_ratio?: number
  pump?: boolean
}

export function seriesPumpRatio(row: SeriesPumpRow): number {
  if (typeof row.pump_on_ratio === "number") {
    return row.pump_on_ratio
  }

  return row.pump ? 1 : 0
}
