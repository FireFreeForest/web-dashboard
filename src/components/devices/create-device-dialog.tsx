import { useCallback, useState, type FormEvent } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, PlusSignIcon } from "@hugeicons/core-free-icons"
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
import { useCreateDevice } from "@/features/devices/mutations"
import {
  createDeviceSchema,
  type CreateDeviceFormValues,
} from "@/features/devices/schema"
import type { CreateDeviceInput } from "@/features/devices/types"
import { useReverseGeocodeLocation } from "@/features/geocode/use-reverse-geocode-location"
import { ApiError } from "@/lib/api/types"

type FieldErrors = Partial<Record<keyof CreateDeviceFormValues, string>>

function getCreateDeviceErrorMessage(error: ApiError): string {
  switch (error.code) {
    case "invalid_request":
      return "Payload device tidak valid."
    case "network_error":
      return "Tidak dapat terhubung ke server."
    default:
      return error.message
  }
}

export function CreateDeviceDialog() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [locationName, setLocationName] = useState("")
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const createDevice = useCreateDevice()
  const {
    request: requestGeocode,
    cancel: cancelGeocode,
    isResolving: isGeocodeResolving,
  } = useReverseGeocodeLocation({ onLabel: setLocationName })

  const reset = () => {
    setName("")
    setLocationName("")
    setLatitude("")
    setLongitude("")
    setErrors({})
    setErrorMessage(null)
    cancelGeocode()
    createDevice.reset()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      reset()
    }
  }

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

    const input: CreateDeviceInput = parsed.data

    try {
      await createDevice.mutateAsync(input)
      toast.success("Device berhasil ditambahkan.")
      handleOpenChange(false)
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? getCreateDeviceErrorMessage(error)
          : "Terjadi kesalahan."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <HugeiconsIcon
          icon={PlusSignIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Tambah Device
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Device</DialogTitle>
          <DialogDescription>
            Device ID akan dibuat otomatis oleh server.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="create-device-name">Nama</FieldLabel>
              <Input
                id="create-device-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ketapang Ridge Station"
                aria-invalid={Boolean(errors.name)}
                disabled={createDevice.isPending}
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
              <FieldLabel htmlFor="create-device-location">Lokasi</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="create-device-location"
                  value={locationName}
                  onChange={(event) => handleLocationChange(event.target.value)}
                  placeholder="Ketapang, Kalimantan Barat"
                  aria-invalid={Boolean(errors.location_name)}
                  disabled={createDevice.isPending}
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
                type="submit"
                disabled={createDevice.isPending || isGeocodeResolving}
              >
                {createDevice.isPending ? "Menyimpan..." : "Tambah Device"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
