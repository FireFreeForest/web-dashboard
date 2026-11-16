import { useCallback, useEffect, useRef, useState } from "react"

import { useReverseGeocode } from "./mutations"

type UseReverseGeocodeLocationOptions = {
  onLabel: (label: string) => void
  delayMs?: number
}

export function useReverseGeocodeLocation({
  onLabel,
  delayMs = 1000,
}: UseReverseGeocodeLocationOptions) {
  const reverseGeocode = useReverseGeocode()
  const requestRef = useRef({ id: 0 })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isScheduled, setIsScheduled] = useState(false)

  const clearTimer = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const cancel = useCallback(() => {
    requestRef.current.id++
    clearTimer()
    setIsScheduled(false)
    reverseGeocode.reset()
  }, [clearTimer, reverseGeocode])

  const request = useCallback(
    (latitude: number, longitude: number) => {
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return

      const requestId = ++requestRef.current.id
      clearTimer()
      reverseGeocode.reset()
      setIsScheduled(true)

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null
        setIsScheduled(false)

        reverseGeocode.mutate(
          { latitude, longitude },
          {
            onSuccess: (result) => {
              if (requestId !== requestRef.current.id) return
              if (result.label) onLabel(result.label)
            },
          }
        )
      }, delayMs)
    },
    [clearTimer, delayMs, onLabel, reverseGeocode]
  )

  useEffect(() => {
    const requestState = requestRef.current
    return () => {
      requestState.id++
      clearTimer()
    }
  }, [clearTimer])

  return {
    request,
    cancel,
    isPending: reverseGeocode.isPending,
    isError: reverseGeocode.isError,
    isResolving: isScheduled || reverseGeocode.isPending,
  }
}
