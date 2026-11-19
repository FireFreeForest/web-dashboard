import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

import {
  MAX_CUSTOM_RANGE_DAYS,
  type CustomTrendRange,
} from "./node-trends-data"

const MS_PER_DAY = 24 * 60 * 60 * 1000

type RangeForm = {
  from?: Date
  to?: Date
  error: string | null
}

function createInitialForm(value: CustomTrendRange | null): RangeForm {
  const fallbackTo = new Date()
  const fallbackFrom = new Date(fallbackTo.getTime() - MS_PER_DAY)

  return {
    from: value?.from ?? fallbackFrom,
    to: value?.to ?? fallbackTo,
    error: null,
  }
}

export function NodeCustomRangeDialog({
  open,
  onOpenChange,
  value,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: CustomTrendRange | null
  onApply: (range: CustomTrendRange) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <CustomRangeForm
          key={open ? "open" : "closed"}
          value={value}
          onApply={onApply}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function CustomRangeForm({
  value,
  onApply,
  onClose,
}: {
  value: CustomTrendRange | null
  onApply: (range: CustomTrendRange) => void
  onClose: () => void
}) {
  const id = useId()
  const fromId = `${id}-from`
  const toId = `${id}-to`
  const [form, setForm] = useState<RangeForm>(() => createInitialForm(value))

  const handleApply = () => {
    const { from, to } = form

    if (!from) {
      setForm((current) => ({
        ...current,
        error: "Pilih waktu mulai.",
      }))
      return
    }

    if (!to) {
      setForm((current) => ({
        ...current,
        error: "Pilih waktu selesai.",
      }))
      return
    }

    if (to.getTime() <= from.getTime()) {
      setForm((current) => ({
        ...current,
        error: "Waktu selesai harus setelah waktu mulai.",
      }))
      return
    }

    if (to.getTime() > Date.now()) {
      setForm((current) => ({
        ...current,
        error: "Waktu selesai tidak boleh melewati waktu sekarang.",
      }))
      return
    }

    if (to.getTime() - from.getTime() > MAX_CUSTOM_RANGE_DAYS * MS_PER_DAY) {
      setForm((current) => ({
        ...current,
        error: `Rentang maksimal ${MAX_CUSTOM_RANGE_DAYS} hari.`,
      }))
      return
    }

    onApply({ from, to })
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Rentang Waktu Kustom</DialogTitle>
        <DialogDescription>
          Pilih tanggal dan jam. Rentang maksimal {MAX_CUSTOM_RANGE_DAYS} hari.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-4">
        <Field>
          <FieldLabel htmlFor={fromId}>Waktu mulai</FieldLabel>
          <DateTimePicker
            id={fromId}
            value={form.from}
            onChange={(from) =>
              setForm((current) => ({ ...current, from, error: null }))
            }
            placeholder="Pilih waktu mulai"
            disabledDates={{ after: new Date() }}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={toId}>Waktu selesai</FieldLabel>
          <DateTimePicker
            id={toId}
            value={form.to}
            onChange={(to) =>
              setForm((current) => ({ ...current, to, error: null }))
            }
            placeholder="Pilih waktu selesai"
            disabledDates={{ after: new Date() }}
          />
        </Field>
        <FieldError>{form.error}</FieldError>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button onClick={handleApply}>Terapkan</Button>
      </DialogFooter>
    </>
  )
}
