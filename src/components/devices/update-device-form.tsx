import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SheetFooter } from "@/components/ui/sheet"
import { useUpdateDevice } from "@/features/devices/mutations"
import type { Device, UpdateDeviceInput } from "@/features/devices/types"
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)
    const input: UpdateDeviceInput = {
      name: String(formData.get("name") ?? "").trim() || undefined,
      location_name:
        String(formData.get("location_name") ?? "").trim() || undefined,
      latitude: toOptionalNumber(formData.get("latitude")),
      longitude: toOptionalNumber(formData.get("longitude")),
      firmware_version:
        String(formData.get("firmware_version") ?? "").trim() || undefined,
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
          <Input id="name" name="name" defaultValue={device.name} />
        </Field>
        <Field>
          <FieldLabel htmlFor="location_name">Lokasi</FieldLabel>
          <Input
            id="location_name"
            name="location_name"
            defaultValue={device.location_name}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              min={-90}
              max={90}
              step="any"
              defaultValue={device.latitude ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              min={-180}
              max={180}
              step="any"
              defaultValue={device.longitude ?? ""}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="firmware_version">Versi Firmware</FieldLabel>
          <Input
            id="firmware_version"
            name="firmware_version"
            defaultValue={device.firmware_version}
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
