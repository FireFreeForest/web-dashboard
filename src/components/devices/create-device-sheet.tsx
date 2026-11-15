import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

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
import type { CreateDeviceInput } from "@/features/devices/types"
import { ApiError } from "@/lib/api/types"

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

function toOptionalNumber(
  value: FormDataEntryValue | null
): number | undefined {
  if (value === null) {
    return undefined
  }

  const text = String(value).trim()
  if (text === "") {
    return undefined
  }

  const number = Number(text)
  return Number.isFinite(number) ? number : undefined
}

function CreateDeviceForm({ onSuccess }: { onSuccess: () => void }) {
  const createDevice = useCreateDevice()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)
    const input: CreateDeviceInput = {
      device_id: String(formData.get("device_id") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim() || undefined,
      location_name:
        String(formData.get("location_name") ?? "").trim() || undefined,
      latitude: toOptionalNumber(formData.get("latitude")),
      longitude: toOptionalNumber(formData.get("longitude")),
      firmware_version:
        String(formData.get("firmware_version") ?? "").trim() || undefined,
    }

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
            name="device_id"
            placeholder="FFF-KTG-001"
            pattern="[A-Za-z0-9._-]{3,64}"
            required
          />
          <FieldDescription>
            3-64 karakter: huruf, angka, titik, garis bawah, atau strip.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="name">Nama</FieldLabel>
          <Input id="name" name="name" placeholder="Ketapang Ridge Station" />
        </Field>
        <Field>
          <FieldLabel htmlFor="location_name">Lokasi</FieldLabel>
          <Input
            id="location_name"
            name="location_name"
            placeholder="Ketapang, Kalimantan Barat"
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
              placeholder="-1.84"
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
              placeholder="109.98"
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="firmware_version">Versi Firmware</FieldLabel>
          <Input
            id="firmware_version"
            name="firmware_version"
            placeholder="1.2.0"
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
      <SheetContent>
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
