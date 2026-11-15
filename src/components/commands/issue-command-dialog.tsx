import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { WaterPumpIcon } from "@hugeicons/core-free-icons"
import { toast } from "sonner"

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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useIssueCommand } from "@/features/commands/mutations"
import {
  issueCommandSchema,
  type IssueCommandFormValues,
} from "@/features/commands/schema"
import {
  DEFAULT_PUMP_DURATION_SECONDS,
  MAX_PUMP_DURATION_SECONDS,
  type IssueCommandInput,
} from "@/features/commands/types"
import { ApiError } from "@/lib/api/types"

type FieldErrors = Partial<Record<keyof IssueCommandFormValues, string>>

function toFieldErrors(error: ApiError): FieldErrors {
  switch (error.code) {
    case "validation_error":
      return { duration: error.message }
    default:
      return {}
  }
}

function isFieldError(error: ApiError): boolean {
  return error.code === "validation_error"
}

export function IssueCommandDialog({ deviceId }: { deviceId: string }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState(true)
  const [duration, setDuration] = useState(
    String(DEFAULT_PUMP_DURATION_SECONDS)
  )
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID()
  )

  const issueCommand = useIssueCommand()

  const reset = () => {
    setState(true)
    setDuration(String(DEFAULT_PUMP_DURATION_SECONDS))
    setErrors({})
    setFormError(null)
    issueCommand.reset()
  }

  const openDialog = () => {
    reset()
    setIdempotencyKey(crypto.randomUUID())
    setOpen(true)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      reset()
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    const parsed = issueCommandSchema.safeParse({ state, duration })

    if (!parsed.success) {
      const nextErrors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof IssueCommandFormValues
        nextErrors[key] ??= issue.message
      }
      setErrors(nextErrors)
      return
    }

    setErrors({})

    const input: IssueCommandInput = {
      action: "SET_PUMP",
      payload: {
        state: parsed.data.state,
        ...(parsed.data.state ? { duration: parsed.data.duration } : {}),
      },
    }

    try {
      await issueCommand.mutateAsync({ deviceId, input, idempotencyKey })
      toast.success(
        parsed.data.state ? "Pompa dihidupkan." : "Pompa dimatikan."
      )
      handleOpenChange(false)
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(toFieldErrors(error))
        if (!isFieldError(error)) {
          setFormError(error.message)
        }
        return
      }
      setFormError("Terjadi kesalahan tidak terduga.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button size="sm" variant="outline" onClick={openDialog}>
        <HugeiconsIcon
          icon={WaterPumpIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Kirim Command
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kirim Command Pompa</DialogTitle>
          <DialogDescription>
            Nyalakan atau matikan pompa air untuk device ini.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="issue-command-state">
                Nyalakan Pompa
              </FieldLabel>
              <Switch
                id="issue-command-state"
                checked={state}
                onCheckedChange={(checked) => setState(checked)}
                disabled={issueCommand.isPending}
              />
            </Field>
            <Field data-invalid={Boolean(errors.duration)}>
              <FieldLabel htmlFor="issue-command-duration">
                Durasi (detik)
              </FieldLabel>
              <Input
                id="issue-command-duration"
                type="number"
                min={1}
                max={MAX_PUMP_DURATION_SECONDS}
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                aria-invalid={Boolean(errors.duration)}
                disabled={!state || issueCommand.isPending}
              />
              <FieldDescription>
                Hanya berlaku saat pompa dinyalakan.
              </FieldDescription>
              <FieldError>{errors.duration}</FieldError>
            </Field>
            {formError ? <FieldError>{formError}</FieldError> : null}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={issueCommand.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={issueCommand.isPending}>
                {issueCommand.isPending ? "Mengirim..." : "Kirim"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
