import { useEffect, useState } from "react"

const LIVE_UPTIME_TICK_MS = 15_000

export function useLiveUptime(
  onlineSince: string | null | undefined,
  fallbackSeconds: number | null | undefined
): number | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, LIVE_UPTIME_TICK_MS)

    return () => window.clearInterval(timer)
  }, [])

  if (!onlineSince) {
    return fallbackSeconds ?? null
  }

  const onlineSinceMs = Date.parse(onlineSince)

  if (Number.isNaN(onlineSinceMs)) {
    return fallbackSeconds ?? null
  }

  return Math.max(0, Math.floor((now - onlineSinceMs) / 1000))
}
