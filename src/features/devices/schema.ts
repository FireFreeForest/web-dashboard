import { z } from "zod"

export const DEVICE_ID_PATTERN = /^[A-Za-z0-9._-]{3,64}$/

const optionalDeviceId = z.preprocess((value) => {
  if (typeof value !== "string") return value
  const trimmed = value.trim()
  return trimmed === "" ? undefined : trimmed
}, z.string().regex(DEVICE_ID_PATTERN, "Device ID harus 3-64 karakter: huruf, angka, titik, garis bawah, atau strip.").optional())

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional()

function optionalCoordinate(min: number, max: number, label: string) {
  return z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined
      }
      if (typeof value !== "string") return value
      const parsed = Number(value.trim())
      return Number.isFinite(parsed) ? parsed : value
    },
    z
      .number({ message: `${label} harus berupa angka.` })
      .min(min, `${label} minimal ${min}.`)
      .max(max, `${label} maksimal ${max}.`)
      .optional()
  )
}

export const createDeviceSchema = z.object({
  device_id: optionalDeviceId,
  name: optionalText,
  location_name: optionalText,
  latitude: optionalCoordinate(-90, 90, "Latitude"),
  longitude: optionalCoordinate(-180, 180, "Longitude"),
})

export type CreateDeviceFormValues = z.infer<typeof createDeviceSchema>
