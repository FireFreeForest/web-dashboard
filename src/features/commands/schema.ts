import { z } from "zod"

import { MAX_PUMP_DURATION_SECONDS } from "./types"

export const issueCommandSchema = z.object({
  state: z.boolean(),
  duration: z.coerce
    .number()
    .int("Durasi harus bilangan bulat.")
    .min(1, "Durasi minimal 1 detik.")
    .max(
      MAX_PUMP_DURATION_SECONDS,
      `Durasi maksimal ${MAX_PUMP_DURATION_SECONDS} detik.`
    ),
})

export type IssueCommandFormValues = z.infer<typeof issueCommandSchema>
