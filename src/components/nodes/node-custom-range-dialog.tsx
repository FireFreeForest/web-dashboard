import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { id as localeId } from "react-day-picker/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import {
  MAX_CUSTOM_RANGE_DAYS,
  type CustomTrendRange,
} from "./node-trends-data"

const MS_PER_DAY = 24 * 60 * 60 * 1000

type RangeForm = {
  range: DateRange | undefined
  startTime: string
  endTime: string
  error: string | null
}

function pad(value: number): string {
  return String(value).padStart(2, "0")
}

function toTimeInput(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function atLocalTime(date: Date, time: string): Date {
  const [hours = 0, minutes = 0] = time.split(":").map(Number)
  const next = new Date(date)
  next.setHours(hours, minutes, 0, 0)
  return next
}

function createInitialForm(value: CustomTrendRange | null): RangeForm {
  const fallbackTo = new Date()
  const fallbackFrom = new Date(fallbackTo.getTime() - MS_PER_DAY)
  const from = value?.from ?? fallbackFrom
  const to = value?.to ?? fallbackTo

  return {
    range: { from, to },
    startTime: toTimeInput(from),
    endTime: toTimeInput(to),
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
  const [form, setForm] = useState<RangeForm>(() => createInitialForm(value))

  const handleSelect = (range: DateRange | undefined) => {
    setForm((current) => ({ ...current, range, error: null }))
  }

  const handleApply = () => {
    const { range, startTime, endTime } = form

    if (!range?.from) {
      setForm((current) => ({
        ...current,
        error: "Pilih tanggal mulai.",
      }))
      return
    }

    if (!range.to) {
      setForm((current) => ({
        ...current,
        error: "Pilih tanggal selesai.",
      }))
      return
    }

    const from = atLocalTime(range.from, startTime)
    const to = atLocalTime(range.to, endTime)

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
        <Calendar
          mode="range"
          selected={form.range}
          onSelect={handleSelect}
          locale={localeId}
          disabled={{ after: new Date() }}
          className="mx-auto"
        />
        <Field>
          <FieldLabel htmlFor="custom-range-start">Jam mulai</FieldLabel>
          <Input
            id="custom-range-start"
            type="time"
            step={60}
            value={form.startTime}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                startTime: event.target.value,
                error: null,
              }))
            }
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="custom-range-end">Jam selesai</FieldLabel>
          <Input
            id="custom-range-end"
            type="time"
            step={60}
            value={form.endTime}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                endTime: event.target.value,
                error: null,
              }))
            }
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
