import { useId, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"
import type { ColumnFiltersState } from "@tanstack/react-table"

import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
  EVENT_TYPE_FILTER_OPTIONS,
  SEVERITY_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from "@/components/events/event-ui"
import { DeviceCombobox } from "@/components/devices/device-combobox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { EventStatus, EventType, Severity } from "@/features/events/types"

export type EventFilterValues = {
  severity: Severity | "all"
  status: EventStatus | "all"
  eventType: EventType | "all"
  deviceId: string
  from: string
  to: string
}

type EventFilterDraft = {
  severity: Severity | "all"
  status: EventStatus | "all"
  eventType: EventType | "all"
  deviceId: string
  from?: Date
  to?: Date
}

const EMPTY_DRAFT: EventFilterDraft = {
  severity: "all",
  status: "all",
  eventType: "all",
  deviceId: "all",
  from: undefined,
  to: undefined,
}

function parseIsoDate(value: string): Date | undefined {
  if (!value) return undefined

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toDraft(values: EventFilterValues): EventFilterDraft {
  return {
    severity: values.severity,
    status: values.status,
    eventType: values.eventType,
    deviceId: values.deviceId,
    from: parseIsoDate(values.from),
    to: parseIsoDate(values.to),
  }
}

function toColumnFilters(draft: EventFilterDraft): ColumnFiltersState {
  const filters: ColumnFiltersState = []

  if (draft.severity !== "all") {
    filters.push({ id: "severity", value: draft.severity })
  }

  if (draft.status !== "all") {
    filters.push({ id: "status", value: draft.status })
  }

  if (draft.eventType !== "all") {
    filters.push({ id: "event_type", value: draft.eventType })
  }

  if (draft.deviceId !== "all") {
    filters.push({ id: "device_id", value: draft.deviceId })
  }

  if (draft.from) {
    filters.push({ id: "from", value: draft.from.toISOString() })
  }

  if (draft.to) {
    filters.push({ id: "to", value: draft.to.toISOString() })
  }

  return filters
}

export function EventFilterSheet({
  values,
  activeCount,
  onApply,
}: {
  values: EventFilterValues
  activeCount: number
  onApply: (filters: ColumnFiltersState) => void
}) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<EventFilterDraft>(() => toDraft(values))
  const [error, setError] = useState<string | null>(null)

  const severityId = `${id}-severity`
  const statusId = `${id}-status`
  const eventTypeId = `${id}-type`
  const deviceId = `${id}-device`
  const fromId = `${id}-from`
  const toId = `${id}-to`

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(toDraft(values))
      setError(null)
    }

    setOpen(nextOpen)
  }

  const handleApply = () => {
    if (draft.from && draft.to && draft.from.getTime() > draft.to.getTime()) {
      setError("Waktu selesai harus setelah waktu mulai.")
      return
    }

    onApply(toColumnFilters(draft))
    setOpen(false)
  }

  const handleReset = () => {
    setDraft(EMPTY_DRAFT)
    setError(null)
    onApply([])
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger render={<Button type="button" variant="outline" />}>
        <HugeiconsIcon
          icon={FilterIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Filter
        {activeCount > 0 ? <Badge>{activeCount}</Badge> : null}
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Filter Event</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          <FieldGroup className="gap-4">
            <Field className="gap-1.5">
              <FieldLabel htmlFor={severityId}>Keparahan</FieldLabel>
              <Select
                items={SEVERITY_FILTER_OPTIONS}
                value={draft.severity}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    severity: (value ?? "all") as Severity | "all",
                  }))
                }
              >
                <SelectTrigger id={severityId} size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {SEVERITY_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor={statusId}>Status</FieldLabel>
              <Select
                items={STATUS_FILTER_OPTIONS}
                value={draft.status}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    status: (value ?? "all") as EventStatus | "all",
                  }))
                }
              >
                <SelectTrigger id={statusId} size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STATUS_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor={eventTypeId}>Tipe</FieldLabel>
              <Select
                items={EVENT_TYPE_FILTER_OPTIONS}
                value={draft.eventType}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    eventType: (value ?? "all") as EventType | "all",
                  }))
                }
              >
                <SelectTrigger id={eventTypeId} size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {EVENT_TYPE_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor={deviceId}>Device</FieldLabel>
              <DeviceCombobox
                id={deviceId}
                value={draft.deviceId}
                onValueChange={(value) =>
                  setDraft((current) => ({ ...current, deviceId: value }))
                }
              />
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor={fromId}>Waktu mulai</FieldLabel>
              <DateTimePicker
                id={fromId}
                value={draft.from}
                onChange={(from) =>
                  setDraft((current) => ({ ...current, from }))
                }
                placeholder="Pilih waktu mulai"
              />
            </Field>

            <Field className="gap-1.5">
              <FieldLabel htmlFor={toId}>Waktu selesai</FieldLabel>
              <DateTimePicker
                id={toId}
                value={draft.to}
                onChange={(to) => setDraft((current) => ({ ...current, to }))}
                placeholder="Pilih waktu selesai"
              />
            </Field>

            <FieldError>{error}</FieldError>
          </FieldGroup>
        </div>
        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleReset}
          >
            Atur Ulang
          </Button>
          <Button type="button" className="w-full" onClick={handleApply}>
            Terapkan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
