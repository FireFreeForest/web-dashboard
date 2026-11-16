import { z } from "zod"

function requiredCoordinate(min: number, max: number, label: string) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") return value
      const trimmed = value.trim()
      return trimmed === "" ? undefined : Number(trimmed)
    },
    z
      .number({ message: `${label} wajib dipilih di peta.` })
      .min(min, `${label} minimal ${min}.`)
      .max(max, `${label} maksimal ${max}.`)
  )
}

export const createDeviceSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi."),
  location_name: z.string().trim().min(1, "Lokasi wajib diisi."),
  latitude: requiredCoordinate(-90, 90, "Latitude"),
  longitude: requiredCoordinate(-180, 180, "Longitude"),
})

export type CreateDeviceFormValues = z.infer<typeof createDeviceSchema>
