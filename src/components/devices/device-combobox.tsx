import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { deviceQueryOptions, useDevices } from "@/features/devices/queries"
import type { Device } from "@/features/devices/types"

const EMPTY_DEVICES: Device[] = []

export function DeviceCombobox({
  id,
  value,
  onValueChange,
  placeholder = "Cari device...",
  disabled,
  className,
}: {
  id?: string
  value: string
  onValueChange: (deviceCode: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const devicesQuery = useDevices({
    q: debouncedSearch || undefined,
    per_page: 20,
  })
  const selectedDeviceQuery = useQuery({
    ...deviceQueryOptions(value),
    enabled: value !== "all",
  })

  const results = devicesQuery.data?.data ?? EMPTY_DEVICES

  const selectedDevice = useMemo(() => {
    if (value === "all") return null

    return (
      results.find((device) => device.device_id === value) ??
      selectedDeviceQuery.data ??
      null
    )
  }, [value, results, selectedDeviceQuery.data])

  const items = useMemo(() => {
    if (!selectedDevice) return results
    if (results.some((device) => device.id === selectedDevice.id)) {
      return results
    }

    return [selectedDevice, ...results]
  }, [results, selectedDevice])

  const isFetching = devicesQuery.isFetching || selectedDeviceQuery.isFetching

  const handleValueChange = (device: Device | null) => {
    onValueChange(device?.device_id ?? "all")
    setSearch("")
  }

  return (
    <Combobox
      items={items}
      value={selectedDevice}
      filter={null}
      disabled={disabled}
      itemToStringLabel={(device) => device.name || device.device_id}
      isItemEqualToValue={(item, itemValue) => item.id === itemValue.id}
      onValueChange={handleValueChange}
      onInputValueChange={(nextValue, details) => {
        if (details.reason !== "item-press") {
          setSearch(nextValue)
        }
      }}
      onOpenChangeComplete={(nextOpen) => {
        if (!nextOpen) {
          setSearch("")
        }
      }}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        showClear
        disabled={disabled}
        className={className}
      />
      <ComboboxContent>
        {isFetching && items.length > 0 ? (
          <p className="px-3 py-2 text-xs text-muted-foreground">
            Memperbarui device...
          </p>
        ) : null}
        <ComboboxEmpty>
          {devicesQuery.isError
            ? "Gagal memuat device."
            : isFetching
              ? "Memuat device..."
              : search.trim()
                ? "Device tidak ditemukan."
                : "Belum ada device."}
        </ComboboxEmpty>
        <ComboboxList>
          {(device: Device) => (
            <ComboboxItem
              key={device.id}
              value={device}
              className="items-start"
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-medium">
                  {device.name || device.device_id}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {device.device_id}
                  {device.location_name ? ` · ${device.location_name}` : ""}
                </span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
