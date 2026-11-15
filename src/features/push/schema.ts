import { z } from "zod"

const optionalPlatform = z.preprocess((value) => {
  if (typeof value !== "string") return value
  const trimmed = value.trim().toLowerCase()
  return trimmed === "" ? undefined : trimmed
}, z.string().max(50, "Platform maksimal 50 karakter.").optional())

const tokenField = z.string().trim().min(1, "Token FCM wajib diisi.")

export const registerPushTokenSchema = z.object({
  token: tokenField,
  platform: optionalPlatform,
})

export const deletePushTokenSchema = z.object({
  token: tokenField,
})

export type RegisterPushTokenFormValues = z.infer<
  typeof registerPushTokenSchema
>

export type DeletePushTokenFormValues = z.infer<typeof deletePushTokenSchema>
