import * as React from "react"

export type MapMode = "flat" | "globe"

type MapModeProviderProps = {
  children: React.ReactNode
  defaultMapMode?: MapMode
  storageKey?: string
}

type MapModeProviderState = {
  mapMode: MapMode
  setMapMode: (mapMode: MapMode) => void
}

const MAP_MODE_VALUES: MapMode[] = ["flat", "globe"]

const MapModeProviderContext = React.createContext<
  MapModeProviderState | undefined
>(undefined)

function isMapMode(value: string | null): value is MapMode {
  if (value === null) {
    return false
  }

  return MAP_MODE_VALUES.includes(value as MapMode)
}

export function MapModeProvider({
  children,
  defaultMapMode = "flat",
  storageKey = "map-mode",
  ...props
}: MapModeProviderProps) {
  const [mapMode, setMapModeState] = React.useState<MapMode>(() => {
    const storedMapMode = localStorage.getItem(storageKey)
    if (isMapMode(storedMapMode)) {
      return storedMapMode
    }

    return defaultMapMode
  })

  const setMapMode = React.useCallback(
    (nextMapMode: MapMode) => {
      localStorage.setItem(storageKey, nextMapMode)
      setMapModeState(nextMapMode)
    },
    [storageKey]
  )

  React.useEffect(() => {
    if (!isMapMode(localStorage.getItem(storageKey))) {
      localStorage.setItem(storageKey, defaultMapMode)
    }
  }, [defaultMapMode, storageKey])

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return
      }

      if (event.key !== storageKey) {
        return
      }

      if (isMapMode(event.newValue)) {
        setMapModeState(event.newValue)
        return
      }

      setMapModeState(defaultMapMode)
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [defaultMapMode, storageKey])

  const value = React.useMemo(
    () => ({
      mapMode,
      setMapMode,
    }),
    [mapMode, setMapMode]
  )

  return (
    <MapModeProviderContext.Provider {...props} value={value}>
      {children}
    </MapModeProviderContext.Provider>
  )
}

export const useMapMode = () => {
  const context = React.useContext(MapModeProviderContext)

  if (context === undefined) {
    throw new Error("useMapMode must be used within a MapModeProvider")
  }

  return context
}
