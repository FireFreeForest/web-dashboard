import { useCallback, useState, type FormEvent } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

import { DeviceLocationPicker } from "@/components/devices/device-location-picker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useUpdateDevice } from "@/features/devices/mutations"
import {
  createDeviceSchema,
  type CreateDeviceFormValues,
} from "@/features/devices/schema"
import type { Device, UpdateDeviceInput } from "@/features/devices/types"
import { useReverseGeocodeLocation } from "@/features/geocode/use-reverse-geocode-location"
import { ApiError } from "@/lib/api/types"

type FieldErrors = Partial<Record<keyof CreateDeviceFormValues, string>>

function getUpdateDeviceErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "invalid_request":
      return "Data Device tidak valid."
    case "not_found":
      return "Device tidak ditemukan."
    case "network_error":
      return "Tidak dapat terhubung ke server."
    default:
      return error.message
  }
}

function EditDeviceForm({
  device,
  onCancel,
  onSuccess,
}: {
  device: Device
  onCancel: () => void
  onSuccess: () => void
}) {
  const updateDevice = useUpdateDevice()
  const [name, setName] = useState(device.name)
  const [locationName, setLocationName] = useState(device.location_name)
  const [latitude, setLatitude] = useState(
    device.latitude !== null ? String(device.latitude) : ""
  )
  const [longitude, setLongitude] = useState(
    device.longitude !== null ? String(device.longitude) : ""
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    request: requestGeocode,
    cancel: cancelGeocode,
    isResolving: isGeocodeResolving,
  } = useReverseGeocodeLocation({ onLabel: setLocationName })

  const handleMapPick = useCallback(
    (nextLatitude: string, nextLongitude: string) => {
      setLatitude(nextLatitude)
      setLongitude(nextLongitude)
      setErrors((current) => ({
        ...current,
        latitude: undefined,
        longitude: undefined,
      }))

      requestGeocode(Number(nextLatitude), Number(nextLongitude))
    },
    [requestGeocode]
  )

  const handleLocationChange = (value: string) => {
    cancelGeocode()
    setLocationName(value)
    setErrors((current) => ({
      ...current,
      location_name: undefined,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const parsed = createDeviceSchema.safeParse({
      name,
      location_name: locationName,
      latitude,
      longitude,
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

    const input: UpdateDeviceInput = parsed.data

    try {
      await updateDevice.mutateAsync({ deviceId: device.device_id, input })
      toast.success("Device berhasil diperbarui.")
      onSuccess()
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.code === "not_found") {
          toast.error("Device tidak ditemukan.")
          onSuccess()
          return
        }

        setErrorMessage(getUpdateDeviceErrorMessage(error))
        return
      }

      setErrorMessage("Terjadi kesalahan.")
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FieldGroup>
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="edit-device-name">Nama</FieldLabel>
          <Input
            id="edit-device-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ketapang Ridge Station"
            aria-invalid={Boolean(errors.name)}
            disabled={updateDevice.isPending}
          />
          <FieldError>{errors.name}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.latitude || errors.longitude)}>
          <FieldLabel>Pilih lokasi di peta</FieldLabel>
          <DeviceLocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={handleMapPick}
            showFullscreen
          />
          <FieldError>{errors.latitude ?? errors.longitude}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.location_name)}>
          <FieldLabel htmlFor="edit-device-location">Lokasi</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="edit-device-location"
              value={locationName}
              onChange={(event) => handleLocationChange(event.target.value)}
              placeholder="Ketapang, Kalimantan Barat"
              aria-invalid={Boolean(errors.location_name)}
              disabled={updateDevice.isPending}
            />
            {isGeocodeResolving ? (
              <InputGroupAddon align="inline-end">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="size-4 animate-spin text-muted-foreground"
                />
              </InputGroupAddon>
            ) : null}
          </InputGroup>
          <FieldError>{errors.location_name}</FieldError>
        </Field>
        {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={updateDevice.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={updateDevice.isPending || isGeocodeResolving}
          >
            {updateDevice.isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </FieldGroup>
    </form>
  )
}

export function EditDeviceDialog({
  device,
  open,
  onOpenChange,
}: {
  device: Device | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ubah Device</DialogTitle>
          <DialogDescription>Perbarui informasi Device.</DialogDescription>
        </DialogHeader>
        {device ? (
          <EditDeviceForm
            key={device.id}
            device={device}
            onCancel={() => onOpenChange(false)}
            onSuccess={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
