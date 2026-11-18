import { useMemo, useState } from "react"

import {
  getTrendInterval,
  getTrendWindow,
  type CustomTrendRange,
  type TrendRange,
  type TrendSelection,
} from "./node-trends-data"

export function useTrendRange(now: number, initialRange: TrendRange = "1H") {
  const [selection, setSelection] = useState<TrendSelection>(() => ({
    kind: "preset",
    range: initialRange,
  }))

  const rangeWindow = useMemo(
    () => getTrendWindow(selection, now),
    [selection, now]
  )
  const interval = useMemo(() => getTrendInterval(selection), [selection])

  const setPreset = (range: TrendRange) => {
    setSelection({ kind: "preset", range })
  }

  const setCustom = (range: CustomTrendRange) => {
    setSelection({ kind: "custom", ...range })
  }

  return { selection, rangeWindow, interval, setPreset, setCustom }
}
