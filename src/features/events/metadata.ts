import { adcToInvertedPercent, adcToPercent } from "@/features/telemetry/utils"
import { formatTemperature } from "@/lib/utils"

import type { EventMetadata } from "./types"

export function hasEventMetadata(
  metadata: EventMetadata | null | undefined
): boolean {
  return !!metadata && Object.keys(metadata).length > 0
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

export function formatEventTemperature(value: unknown): string {
  return isNumber(value) ? formatTemperature(value) : "-"
}

export function formatEventHumidity(value: unknown): string {
  return isNumber(value) ? `${value}%` : "-"
}

export function formatEventAdcPercent(value: unknown): string {
  return isNumber(value) ? `${adcToPercent(value)}%` : "-"
}

export function formatEventFlameLevel(metadata: EventMetadata): string {
  if (isNumber(metadata.flame_level)) {
    return `${adcToInvertedPercent(metadata.flame_level)}%`
  }

  return metadata.flame_detected ? "Terdeteksi" : "-"
}
