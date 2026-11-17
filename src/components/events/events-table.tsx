import { useId, useMemo, useState } from "react"
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import {
  useTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { FilterIcon } from "@hugeicons/core-free-icons"

import { DataTable } from "@/components/data-table/data-table"
import { TablePagination } from "@/components/data-table/table-pagination"
import { EventDetailSheet } from "@/components/events/event-detail-sheet"
import {
  EVENT_TYPE_LABEL,
  EVENT_TYPE_OPTIONS,
  formatTimestamp,
  SeverityBadge,
  StatusBadge,
} from "@/components/events/event-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useMe } from "@/features/auth/queries"
import { useDevices } from "@/features/devices/queries"
import type { Device } from "@/features/devices/types"
import { useEvents } from "@/features/events/queries"
import type {
  Event,
  EventStatus,
  EventType,
  Severity,
} from "@/features/events/types"
import { paginationTableFeatures } from "@/lib/data-table/features"

type EventFiltersProps = {
  severity: Severity | "all"
  status: EventStatus | "all"
  eventType: EventType | "all"
  deviceId: string
  devices: Device[]
  onSeverityChange: (value: Severity | "all") => void
  onStatusChange: (value: EventStatus | "all") => void
  onEventTypeChange: (value: EventType | "all") => void
  onDeviceIdChange: (value: string) => void
}

function EventFilterFields({
  severity,
  status,
  eventType,
  deviceId,
  devices,
  onSeverityChange,
  onStatusChange,
  onEventTypeChange,
  onDeviceIdChange,
  className,
}: EventFiltersProps & { className?: string }) {
  const filterId = useId()
  const severityId = `${filterId}-severity`
  const statusId = `${filterId}-status`
  const eventTypeId = `${filterId}-type`
  const deviceIdField = `${filterId}-device`

  return (
    <FieldGroup className={className}>
      <Field className="gap-1.5">
        <FieldLabel htmlFor={severityId}>Severity</FieldLabel>
        <Select
          value={severity}
          onValueChange={(value) =>
            onSeverityChange((value ?? "all") as Severity | "all")
          }
        >
          <SelectTrigger id={severityId} size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Semua severity</SelectItem>
              <SelectItem value="error">Error</SelectItem>
              <SelectItem value="warning">Peringatan</SelectItem>
              <SelectItem value="critical">Kritis</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field className="gap-1.5">
        <FieldLabel htmlFor={statusId}>Status</FieldLabel>
        <Select
          value={status}
          onValueChange={(value) =>
            onStatusChange((value ?? "all") as EventStatus | "all")
          }
        >
          <SelectTrigger id={statusId} size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Semua status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field className="gap-1.5">
        <FieldLabel htmlFor={eventTypeId}>Tipe</FieldLabel>
        <Select
          value={eventType}
          onValueChange={(value) =>
            onEventTypeChange((value ?? "all") as EventType | "all")
          }
        >
          <SelectTrigger id={eventTypeId} size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Semua tipe</SelectItem>
              {EVENT_TYPE_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Field className="gap-1.5">
        <FieldLabel htmlFor={deviceIdField}>Device</FieldLabel>
        <Select
          value={deviceId}
          onValueChange={(value) => onDeviceIdChange(value ?? "all")}
        >
          <SelectTrigger id={deviceIdField} size="sm" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">Semua device</SelectItem>
              {devices.map((device) => (
                <SelectItem key={device.id} value={device.device_id}>
                  {device.device_id}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    </FieldGroup>
  )
}

function MobileEventFilters({
  activeCount,
  onReset,
  ...filters
}: EventFiltersProps & {
  activeCount: number
  onReset: () => void
}) {
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="md:hidden"
          />
        }
      >
        <HugeiconsIcon
          icon={FilterIcon}
          strokeWidth={2}
          data-icon="inline-start"
        />
        Filter
        {activeCount > 0 ? (
          <Badge variant="secondary">{activeCount}</Badge>
        ) : null}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Filter event</DrawerTitle>
          <DrawerDescription>
            Pilih filter untuk mempersempit daftar event.
          </DrawerDescription>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <EventFilterFields {...filters} className="gap-3" />
        </div>
        <DrawerFooter className="flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onReset}
            disabled={activeCount === 0}
          >
            Reset
          </Button>
          <DrawerClose render={<Button type="button" className="flex-1" />}>
            Terapkan
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export function EventsTable() {
  const { data: user } = useMe()
  const { data: devicesData } = useDevices({ per_page: 100 })
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const pagination = useSelector(paginationAtom)
  const [severity, setSeverity] = useState<Severity | "all">("all")
  const [status, setStatus] = useState<EventStatus | "all">("all")
  const [eventType, setEventType] = useState<EventType | "all">("all")
  const [deviceId, setDeviceId] = useState<string>("all")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const devices = devicesData?.data ?? []

  const query = useEvents({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    severity: severity === "all" ? undefined : severity,
    status: status === "all" ? undefined : status,
    event_type: eventType === "all" ? undefined : eventType,
    device_id: deviceId === "all" ? undefined : deviceId,
  })

  const data = query.data?.data ?? []
  const total = query.data?.meta.total ?? 0

  const columns = useMemo<
    Array<ColumnDef<typeof paginationTableFeatures, Event>>
  >(
    () => [
      {
        accessorKey: "triggered_at",
        header: "Waktu",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatTimestamp(row.original.triggered_at)}
          </span>
        ),
      },
      {
        accessorKey: "event_type",
        header: "Tipe",
        cell: ({ row }) => (
          <span className="font-medium">
            {EVENT_TYPE_LABEL[row.original.event_type]}
          </span>
        ),
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "message",
        header: "Pesan",
        cell: ({ row }) => (
          <span className="line-clamp-1 text-muted-foreground">
            {row.original.message}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedEventId(row.original.id)}
            >
              Detail
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  const table = useTable(
    {
      features: paginationTableFeatures,
      columns,
      data,
      getRowId: (row) => row.id,
      rowCount: total,
      manualPagination: true,
      atoms: {
        pagination: paginationAtom,
      },
    },
    (state) => ({
      pagination: state.pagination,
    })
  )

  const resetPage = () => {
    paginationAtom.set((state) => ({ ...state, pageIndex: 0 }))
  }

  const activeFilterCount = [severity, status, eventType, deviceId].filter(
    (value) => value !== "all"
  ).length

  const resetFilters = () => {
    setSeverity("all")
    setStatus("all")
    setEventType("all")
    setDeviceId("all")
    resetPage()
  }

  const handleSeverityChange = (value: Severity | "all") => {
    setSeverity(value)
    resetPage()
  }

  const handleStatusChange = (value: EventStatus | "all") => {
    setStatus(value)
    resetPage()
  }

  const handleEventTypeChange = (value: EventType | "all") => {
    setEventType(value)
    resetPage()
  }

  const handleDeviceIdChange = (value: string) => {
    setDeviceId(value)
    resetPage()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Filter event
          </p>
          <MobileEventFilters
            severity={severity}
            status={status}
            eventType={eventType}
            deviceId={deviceId}
            devices={devices}
            onSeverityChange={handleSeverityChange}
            onStatusChange={handleStatusChange}
            onEventTypeChange={handleEventTypeChange}
            onDeviceIdChange={handleDeviceIdChange}
            activeCount={activeFilterCount}
            onReset={resetFilters}
          />
        </div>
        <div className="hidden md:block">
          <EventFilterFields
            severity={severity}
            status={status}
            eventType={eventType}
            deviceId={deviceId}
            devices={devices}
            onSeverityChange={handleSeverityChange}
            onStatusChange={handleStatusChange}
            onEventTypeChange={handleEventTypeChange}
            onDeviceIdChange={handleDeviceIdChange}
            className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4"
          />
        </div>
      </div>

      {query.isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : query.error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl p-6 text-center ring-1 ring-foreground/10">
          <p className="text-sm text-muted-foreground">{query.error.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
          >
            Coba lagi
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div
            className={
              query.isFetching ? "opacity-60 transition-opacity" : undefined
            }
          >
            <DataTable
              table={table}
              caption="Events"
              emptyMessage="Belum ada event."
              className="min-w-[44rem]"
            />
          </div>
          <TablePagination
            paginationAtom={paginationAtom}
            total={total}
            isFetching={query.isFetching}
          />
        </div>
      )}

      <EventDetailSheet
        eventId={selectedEventId}
        open={selectedEventId !== null}
        canAcknowledge={user?.role === "admin" || user?.role === "petugas"}
        canResolve={user?.role === "petugas"}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEventId(null)
          }
        }}
      />
    </div>
  )
}
