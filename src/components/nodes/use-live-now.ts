import { useEffect, useRef, useState } from "react"

import { useRealtime } from "@/components/providers/realtime-provider"
import type { RealtimeMessage } from "@/features/realtime/types"

const LIVE_NOW_TICK_MS = 15_000
const REALTIME_BUMP_THROTTLE_MS = 4_000

export type LiveTelemetryKind = "environment" | "fire"

function isDeviceTelemetryMessage(
  message: RealtimeMessage | null,
  deviceId: string,
  kind: LiveTelemetryKind
): boolean {
  if (!message) {
    return false
  }

  if (message.type === "telemetry.environment") {
    return kind === "environment" && message.device_id === deviceId
  }

  if (message.type === "telemetry.fire") {
    return kind === "fire" && message.device_id === deviceId
  }

  return false
}

export function useLiveNow(deviceId: string, kind: LiveTelemetryKind): number {
  const { lastMessage } = useRealtime()
  const [now, setNow] = useState(() => Date.now())
  const lastRealtimeBumpRef = useRef(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, LIVE_NOW_TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isDeviceTelemetryMessage(lastMessage, deviceId, kind)) {
      return
    }

    const currentTime = Date.now()

    if (currentTime - lastRealtimeBumpRef.current < REALTIME_BUMP_THROTTLE_MS) {
      return
    }

    lastRealtimeBumpRef.current = currentTime
    setNow(currentTime)
  }, [deviceId, kind, lastMessage])

  return now
}
