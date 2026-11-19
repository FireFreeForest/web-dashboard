import { useState } from "react"
import { format } from "date-fns"
import { id as localeId } from "react-day-picker/locale"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar03Icon, Cancel01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

const HOURS = Array.from({ length: 24 }, (_, index) => 23 - index)
const MINUTES = Array.from({ length: 12 }, (_, index) => index * 5)

export function DateTimePicker({
  id,
  value,
  onChange,
  placeholder = "Pilih tanggal & waktu",
  disabled,
  className,
}: {
  id?: string
  value?: Date
  onChange: (value: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    const next = new Date(selectedDate)
    next.setHours(value?.getHours() ?? 0, value?.getMinutes() ?? 0, 0, 0)
    onChange(next)
  }

  const handleTimeChange = (type: "hour" | "minute", amount: number) => {
    if (!value) return

    const next = new Date(value)
    if (type === "hour") {
      next.setHours(amount)
    } else {
      next.setMinutes(amount)
    }
    next.setSeconds(0, 0)
    onChange(next)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              className
            )}
          />
        }
      >
        <HugeiconsIcon
          icon={Calendar03Icon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        {value ? (
          format(value, "dd MMM yyyy HH:mm", { locale: localeId })
        ) : (
          <span>{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            locale={localeId}
          />
          <div className="flex divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {HOURS.map((hour) => (
                  <Button
                    key={hour}
                    type="button"
                    size="icon"
                    variant={value?.getHours() === hour ? "default" : "ghost"}
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() => handleTimeChange("hour", hour)}
                    disabled={!value}
                  >
                    {String(hour).padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {MINUTES.map((minute) => (
                  <Button
                    key={minute}
                    type="button"
                    size="icon"
                    variant={
                      value?.getMinutes() === minute ? "default" : "ghost"
                    }
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() => handleTimeChange("minute", minute)}
                    disabled={!value}
                  >
                    {String(minute).padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(undefined)}
            disabled={!value}
          >
            <HugeiconsIcon icon={Cancel01Icon} data-icon="inline-start" />
            Kosongkan
          </Button>
          <Button type="button" size="sm" onClick={() => setOpen(false)}>
            Selesai
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
