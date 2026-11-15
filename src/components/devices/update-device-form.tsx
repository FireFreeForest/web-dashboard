import { useCallback, useRef, useState } from "react"

import { DeviceLocationPicker } from "@/components/devices/device-location-picker"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SheetFooter } from "@/components/ui/sheet"
import { useUpdateDevice } from "@/features/devices/mutations"
import type { Device, UpdateDeviceInput } from "@/features/devices/types"
import { useReverseGeocode } from "@/features/geocode/mutations"
import { ApiError } from "@/lib/api/types"
import { toOptionalNumber } from "@/lib/utils"

function getUpdateDeviceErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "invalid_request":
      return "Payload device tidak valid."
    case "not_found":
      return "Device tidak ditemukan."
    case "network_error":
      return "Tidak dapat terhubung ke server."
    default:
      return error.message
  }
}

export function UpdateDeviceForm({
  device,
  onCancel,
  onSuccess,
}: {
  device: Device
  onCancel: () => void
  onSuccess: () => void
}) {
  const updateDevice = useUpdateDevice()
  const reverseGeocode = useReverseGeocode()
  const geocodeRequestRef = useRef(0)
  const [name, setName] = useState(device.name)
  const [locationName, setLocationName] = useState(device.location_name)
  const [latitude, setLatitude] = useState(
    device.latitude !== null ? String(device.latitude) : ""
  )
  const [longitude, setLongitude] = useState(
    device.longitude !== null ? String(device.longitude) : ""
  )
  const [firmwareVersion, setFirmwareVersion] = useState(
    device.firmware_version
  )
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleMapPick = useCallback(
    (nextLatitude: string, nextLongitude: string) => {
      setLatitude(nextLatitude)
      setLongitude(nextLongitude)

      const latitudeValue = Number(nextLatitude)
      const longitudeValue = Number(nextLongitude)
      if (!Number.isFinite(latitudeValue) || !Number.isFinite(longitudeValue)) {
        return
      }

      const requestId = ++geocodeRequestRef.current
      reverseGeocode.mutate(
        { latitude: latitudeValue, longitude: longitudeValue },
        {
          onSuccess: (result) => {
            if (requestId !== geocodeRequestRef.current) return
            if (result.label) {
              setLocationName(result.label)
            }
          },
        }
      )
    },
    [reverseGeocode]
  )

  const handleLocationChange = (value: string) => {
    geocodeRequestRef.current++
    reverseGeocode.reset()
    setLocationName(value)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const input: UpdateDeviceInput = {
      name: name.trim() || undefined,
      location_name: locationName.trim() || undefined,
      latitude: toOptionalNumber(latitude),
      longitude: toOptionalNumber(longitude),
      firmware_version: firmwareVersion.trim() || undefined,
    }

    try {
      await updateDevice.mutateAsync({ deviceId: device.device_id, input })
      onSuccess()
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? getUpdateDeviceErrorMessage(error)
          : "Terjadi kesalahan."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <FieldGroup className="min-h-0 flex-1 gap-5 overflow-y-auto px-6 pb-6">
        <Field>
          <FieldLabel htmlFor="name">Nama</FieldLabel>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={updateDevice.isPending}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="location_name">Lokasi</FieldLabel>
          <Input
            id="location_name"
            value={locationName}
            onChange={(event) => handleLocationChange(event.target.value)}
            disabled={updateDevice.isPending}
          />
          <FieldDescription>
            {reverseGeocode.isPending
              ? "Mencari nama lokasi dari peta..."
              : reverseGeocode.isError
                ? "Nama lokasi tidak tersedia; isi manual."
                : "Terisi otomatis saat memilih titik di peta. Bisa diubah manual."}
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel>Pilih lokasi di peta</FieldLabel>
          <DeviceLocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={handleMapPick}
          />
          <FieldDescription>
            Klik peta untuk menaruh titik, atau geser marker untuk menyesuaikan
            koordinat.
          </FieldDescription>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
            <Input
              id="latitude"
              type="number"
              min={-90}
              max={90}
              step="any"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              disabled={updateDevice.isPending}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
            <Input
              id="longitude"
              type="number"
              min={-180}
              max={180}
              step="any"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              disabled={updateDevice.isPending}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="firmware_version">Versi Firmware</FieldLabel>
          <Input
            id="firmware_version"
            value={firmwareVersion}
            onChange={(event) => setFirmwareVersion(event.target.value)}
            disabled={updateDevice.isPending}
          />
        </Field>
        <FieldError>{errorMessage}</FieldError>
      </FieldGroup>
      <SheetFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={updateDevice.isPending}
        >
          Batal
        </Button>
        <Button type="submit" disabled={updateDevice.isPending}>
          {updateDevice.isPending ? "Menyimpan..." : "Simpan"}
        </Button>
      </SheetFooter>
    </form>
  )
}
