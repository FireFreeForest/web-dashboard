import { z } from "zod"

import { USER_ROLES } from "./types"

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email wajib diisi.")
  .email("Format email tidak valid.")

const roleField = z.enum(USER_ROLES, { message: "Peran tidak valid." })

export const createUserSchema = z.object({
  email: emailField,
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
  name: z.string().trim(),
  role: roleField,
})

export type CreateUserFormValues = z.infer<typeof createUserSchema>

export const updateUserSchema = z
  .object({
    name: z.string().trim().optional(),
    role: roleField.optional(),
    is_active: z.boolean().optional(),
    password: z
      .string()
      .optional()
      .refine(
        (value) => !value || value.length >= 8,
        "Kata sandi minimal 8 karakter."
      ),
  })
  .refine(
    (values) =>
      values.name !== undefined ||
      values.role !== undefined ||
      values.is_active !== undefined ||
      Boolean(values.password),
    "Isi minimal satu field."
  )

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
