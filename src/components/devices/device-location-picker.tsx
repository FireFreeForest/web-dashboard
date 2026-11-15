import { useCallback, useEffect } from "react"
import type { MapMouseEvent } from "maplibre-gl"

import { Map, MapMarker, MarkerContent, useMap } from "@/components/ui/map"
import { cn } from "@/lib/utils"

const DEFAULT_MAP_CENTER: [number, number] = [113.9, 0.5]

type DeviceLocationPickerProps = {
  latitude: string
  longitude: string
  onChange: (latitude: string, longitude: string) => void
  className?: string
}

function toCoordinate(value: string): number | null {
  if (value.trim() === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function MapClickHandler({
  onPick,
}: {
  onPick: (longitude: number, latitude: number) => void
}) {
  const { map } = useMap()

  useEffect(() => {
    if (!map) return

    const handleClick = (event: MapMouseEvent) => {
      onPick(event.lngLat.lng, event.lngLat.lat)
    }

    map.on("click", handleClick)
    return () => {
      map.off("click", handleClick)
    }
  }, [map, onPick])

  return null
}

export function DeviceLocationPicker({
  latitude,
  longitude,
  onChange,
  className,
}: DeviceLocationPickerProps) {
  const latitudeValue = toCoordinate(latitude)
  const longitudeValue = toCoordinate(longitude)
  const hasMarker =
    latitudeValue !== null &&
    longitudeValue !== null &&
    latitudeValue >= -90 &&
    latitudeValue <= 90 &&
    longitudeValue >= -180 &&
    longitudeValue <= 180

  const center: [number, number] = hasMarker
    ? [longitudeValue, latitudeValue]
    : DEFAULT_MAP_CENTER

  const handlePick = useCallback(
    (nextLongitude: number, nextLatitude: number) => {
      onChange(nextLatitude.toFixed(6), nextLongitude.toFixed(6))
    },
    [onChange]
  )

  return (
    <div className={cn("h-56 overflow-hidden rounded-lg border", className)}>
      <Map
        center={center}
        zoom={hasMarker ? 10 : 5}
        minZoom={3}
        maxZoom={18}
        className="h-full w-full"
      >
        <MapClickHandler onPick={handlePick} />
        {hasMarker && (
          <MapMarker
            longitude={longitudeValue}
            latitude={latitudeValue}
            draggable
            onDragEnd={({ lng, lat }) => handlePick(lng, lat)}
          >
            <MarkerContent />
          </MapMarker>
        )}
      </Map>
    </div>
  )
}
