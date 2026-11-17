export { cn } from "cn"

type DateInput = string | number | Date | null | undefined

function toDate(value: DateInput): Date | null {
  if (value == null || value === "") return null

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

const timeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
})

const shortTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
})

const shortTimeWithSecondsFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})

export function formatDate(value: DateInput): string {
  const date = toDate(value)
  return date ? dateFormatter.format(date) : "—"
}

export function formatTime(value: DateInput): string {
  const date = toDate(value)
  return date ? timeFormatter.format(date) : "—"
}

export function formatDateTime(value: DateInput): string {
  const date = toDate(value)
  if (!date) return "—"

  return `${dateFormatter.format(date)} ${timeFormatter.format(date)}`
}

export function formatShortDate(value: DateInput): string {
  const date = toDate(value)
  return date ? shortDateFormatter.format(date) : "—"
}

export function formatShortTime(value: DateInput): string {
  const date = toDate(value)
  return date ? shortTimeFormatter.format(date) : "—"
}

export function formatShortTimeWithSeconds(value: DateInput): string {
  const date = toDate(value)
  return date ? shortTimeWithSecondsFormatter.format(date) : "—"
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat("id-ID", {
  numeric: "auto",
})

export function formatRelativeTime(value: DateInput): string {
  const date = toDate(value)
  if (!date) return "—"

  const diffMs = date.getTime() - Date.now()
  const absMs = Math.abs(diffMs)

  if (absMs < 60_000) return "baru saja"
  if (absMs < 3_600_000) {
    return relativeTimeFormatter.format(Math.round(diffMs / 60_000), "minute")
  }
  if (absMs < 86_400_000) {
    return relativeTimeFormatter.format(Math.round(diffMs / 3_600_000), "hour")
  }
  if (absMs < 2_592_000_000) {
    return relativeTimeFormatter.format(Math.round(diffMs / 86_400_000), "day")
  }

  return formatDateTime(value)
}

const numberFormatter = new Intl.NumberFormat("id-ID")

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return numberFormatter.format(value)
}

export function formatTemperature(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return `${value.toFixed(1)}°C`
}

export function formatVoltage(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  return `${value.toFixed(2)} V`
}
