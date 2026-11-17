import { HugeiconsIcon } from "@hugeicons/react"
import { MapPinOffIcon } from "@hugeicons/core-free-icons"

import { DeviceLocationMarker } from "@/components/devices/device-location-marker"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
} from "@/components/ui/map"
import type { Device } from "@/features/devices/types"

function getValidCoordinates(device: Device) {
  const { latitude, longitude } = device

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }

  return { latitude, longitude }
}

export function NodeLocationCard({ device }: { device: Device }) {
  const coordinates = getValidCoordinates(device)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lokasi Device</CardTitle>
      </CardHeader>
      <CardContent>
        {coordinates ? (
          <div className="h-56 overflow-hidden rounded-lg border">
            <Map
              center={[coordinates.longitude, coordinates.latitude]}
              zoom={10}
              minZoom={3}
              maxZoom={18}
              className="h-full w-full"
            >
              <MapMarker
                longitude={coordinates.longitude}
                latitude={coordinates.latitude}
              >
                <MarkerContent>
                  <DeviceLocationMarker />
                </MarkerContent>
              </MapMarker>
              <MapControls showZoom={false} showFullscreen />
            </Map>
          </div>
        ) : (
          <Empty className="h-56 rounded-lg bg-muted/50 p-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={MapPinOffIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>Lokasi belum diatur</EmptyTitle>
              <EmptyDescription>
                Koordinat Device belum tersedia.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
