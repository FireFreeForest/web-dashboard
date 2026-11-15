import { useCallback, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useCreateDevice } from "@/features/devices/mutations"
import {
  createDeviceSchema,
  type CreateDeviceFormValues,
} from "@/features/devices/schema"
import type { CreateDeviceInput } from "@/features/devices/types"
import { useReverseGeocode } from "@/features/geocode/mutations"
import { ApiError } from "@/lib/api/types"

type FieldErrors = Partial<Record<keyof CreateDeviceFormValues, string>>

function getCreateDeviceErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "duplicate_device":
      return "device_id sudah terdaftar."
    case "invalid_request":
      return "Payload device tidak valid."
    case "network_error":
      return "Tidak dapat terhubung ke server."
    default:
      return error.message
  }
}

function CreateDeviceForm({ onSuccess }: { onSuccess: () => void }) {
  const createDevice = useCreateDevice()
  const reverseGeocode = useReverseGeocode()
  const geocodeRequestRef = useRef(0)
  const [deviceId, setDeviceId] = useState("")
  const [name, setName] = useState("")
  const [locationName, setLocationName] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [firmwareVersion, setFirmwareVersion] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleMapPick = useCallback(
    (nextLatitude: string, nextLongitude: string) => {
      setLatitude(nextLatitude)
      setLongitude(nextLongitude)
      setErrors((current) => ({
        ...current,
        latitude: undefined,
        longitude: undefined,
      }))

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

    const parsed = createDeviceSchema.safeParse({
      device_id: deviceId,
      name,
      location_name: locationName,
      latitude,
      longitude,
      firmware_version: firmwareVersion,
    })

    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof CreateDeviceFormValues
        nextErrors[key] ??= issue.message
      }
      setErrors(nextErrors)
      return
    }

    setErrors({})

    const input: CreateDeviceInput = parsed.data

    try {
      await createDevice.mutateAsync(input)
      onSuccess()
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? getCreateDeviceErrorMessage(error)
          : "Terjadi kesalahan."
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <FieldGroup className="min-h-0 flex-1 gap-5 overflow-y-auto px-6 pb-6">
        <Field>
          <FieldLabel htmlFor="device_id">Device ID</FieldLabel>
          <Input
            id="device_id"
            value={deviceId}
            onChange={(event) => setDeviceId(event.target.value)}
            placeholder="Otomatis (FFF-XXXXXXXX)"
            aria-invalid={Boolean(errors.device_id)}
            disabled={createDevice.isPending}
          />
          <FieldDescription>
            Kosongkan untuk dibuat otomatis oleh server, atau isi manual 3-64
            karakter: huruf, angka, titik, garis bawah, atau strip.
          </FieldDescription>
          <FieldError>{errors.device_id}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="name">Nama</FieldLabel>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ketapang Ridge Station"
            aria-invalid={Boolean(errors.name)}
            disabled={createDevice.isPending}
          />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="location_name">Lokasi</FieldLabel>
          <Input
            id="location_name"
            value={locationName}
            onChange={(event) => handleLocationChange(event.target.value)}
            placeholder="Ketapang, Kalimantan Barat"
            aria-invalid={Boolean(errors.location_name)}
            disabled={createDevice.isPending}
          />
          <FieldDescription>
            {reverseGeocode.isPending
              ? "Mencari nama lokasi dari peta..."
              : reverseGeocode.isError
                ? "Nama lokasi tidak tersedia; isi manual."
                : "Terisi otomatis saat memilih titik di peta. Bisa diubah manual."}
          </FieldDescription>
          <FieldError>{errors.location_name}</FieldError>
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
          <Field data-invalid={Boolean(errors.latitude)}>
            <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
            <Input
              id="latitude"
              type="number"
              min={-90}
              max={90}
              step="any"
              placeholder="-1.84"
              value={latitude}
              onChange={(event) => setLatitude(event.target.value)}
              aria-invalid={Boolean(errors.latitude)}
              disabled={createDevice.isPending}
            />
            <FieldError>{errors.latitude}</FieldError>
          </Field>
          <Field data-invalid={Boolean(errors.longitude)}>
            <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
            <Input
              id="longitude"
              type="number"
              min={-180}
              max={180}
              step="any"
              placeholder="109.98"
              value={longitude}
              onChange={(event) => setLongitude(event.target.value)}
              aria-invalid={Boolean(errors.longitude)}
              disabled={createDevice.isPending}
            />
            <FieldError>{errors.longitude}</FieldError>
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="firmware_version">Versi Firmware</FieldLabel>
          <Input
            id="firmware_version"
            value={firmwareVersion}
            onChange={(event) => setFirmwareVersion(event.target.value)}
            placeholder="1.2.0"
            disabled={createDevice.isPending}
          />
        </Field>
        <FieldError>{errorMessage}</FieldError>
      </FieldGroup>
      <SheetFooter>
        <Button type="submit" disabled={createDevice.isPending}>
          {createDevice.isPending ? "Menyimpan..." : "Tambah Device"}
        </Button>
      </SheetFooter>
    </form>
  )
}

export function CreateDeviceSheet() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={(next) => setOpen(next)}>
      <SheetTrigger render={<Button size="sm" />}>
        <HugeiconsIcon
          icon={PlusSignIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Tambah Device
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Tambah Device</SheetTitle>
          <SheetDescription>
            Daftarkan perangkat baru ke sistem.
          </SheetDescription>
        </SheetHeader>
        <CreateDeviceForm onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
