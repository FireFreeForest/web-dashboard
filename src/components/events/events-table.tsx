import { useMemo, useState } from "react"
import type { Atom } from "@tanstack/react-store"
import {
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
} from "@tanstack/react-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { TimelineEventIcon } from "@hugeicons/core-free-icons"

import { DataTable } from "@/components/data-table/data-table"
import { TablePagination } from "@/components/data-table/table-pagination"
import { TableToolbar } from "@/components/data-table/table-toolbar"
import { EventDetailSheet } from "@/components/events/event-detail-sheet"
import {
  EventFilterSheet,
  type EventFilterValues,
} from "@/components/events/event-filters"
import {
  EVENT_TYPE_ICON,
  EVENT_TYPE_LABEL,
  SeverityBadge,
  StatusBadge,
} from "@/components/events/event-ui"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import type { Device } from "@/features/devices/types"
import type {
  Event,
  EventStatus,
  EventType,
  Severity,
} from "@/features/events/types"
import { ApiError } from "@/lib/api/types"
import { searchPaginationTableFeatures } from "@/lib/data-table/features"
import { formatDateTime } from "@/lib/utils"

export function EventsTable({
  events,
  total,
  devices,
  paginationAtom,
  columnFiltersAtom,
  isLoading,
  isFetching,
  error,
  onRetry,
  canAcknowledge,
  canResolve,
}: {
  events: Event[]
  total: number
  devices: Device[]
  paginationAtom: Atom<PaginationState>
  columnFiltersAtom: Atom<ColumnFiltersState>
  isLoading: boolean
  isFetching: boolean
  error: ApiError | null
  onRetry: () => void
  canAcknowledge: boolean
  canResolve: boolean
}) {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const deviceMap = useMemo(
    () => new Map(devices.map((device) => [device.id, device])),
    [devices]
  )

  const columns = useMemo<
    Array<ColumnDef<typeof searchPaginationTableFeatures, Event>>
  >(
    () => [
      {
        accessorKey: "triggered_at",
        header: "Waktu",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatDateTime(row.original.triggered_at)}
          </span>
        ),
      },
      {
        accessorKey: "event_type",
        header: "Tipe",
        cell: ({ row }) => (
          <span className="flex items-center gap-2 font-medium">
            <HugeiconsIcon
              icon={EVENT_TYPE_ICON[row.original.event_type]}
              strokeWidth={2}
              className="size-4 text-muted-foreground"
            />
            {EVENT_TYPE_LABEL[row.original.event_type]}
          </span>
        ),
      },
      {
        accessorKey: "severity",
        header: "Keparahan",
        cell: ({ row }) => <SeverityBadge severity={row.original.severity} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "device_id",
        header: "Device",
        accessorFn: (event) => deviceMap.get(event.device_id)?.device_id ?? "-",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{String(getValue())}</span>
        ),
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
        header: () => <span className="sr-only">Aksi</span>,
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
    [deviceMap]
  )

  const table = useTable(
    {
      features: searchPaginationTableFeatures,
      columns,
      data: events,
      getRowId: (event) => event.id,
      rowCount: total,
      manualPagination: true,
      manualFiltering: true,
      atoms: {
        pagination: paginationAtom,
        columnFilters: columnFiltersAtom,
      },
    },
    (state) => ({
      pagination: state.pagination,
      columnFilters: state.columnFilters,
    })
  )

  const getFilterValue = (id: string) =>
    table.state.columnFilters.find((filter) => filter.id === id)?.value

  const filterValues: EventFilterValues = {
    severity: (getFilterValue("severity") ?? "all") as Severity | "all",
    status: (getFilterValue("status") ?? "all") as EventStatus | "all",
    eventType: (getFilterValue("event_type") ?? "all") as EventType | "all",
    deviceId: (getFilterValue("device_id") as string | undefined) ?? "all",
    from: (getFilterValue("from") as string | undefined) ?? "",
    to: (getFilterValue("to") as string | undefined) ?? "",
  }
  const activeFilterCount = table.state.columnFilters.length

  const handleApplyFilters = (next: ColumnFiltersState) => {
    columnFiltersAtom.set(next)
  }

  return (
    <div className="flex flex-col gap-4">
      <TableToolbar
        actions={
          <EventFilterSheet
            values={filterValues}
            activeCount={activeFilterCount}
            onApply={handleApplyFilters}
          />
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : error ? (
        <Empty className="rounded-2xl ring-1 ring-foreground/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={TimelineEventIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Gagal memuat Event</EmptyTitle>
            <EmptyDescription>
              {error.code === "forbidden"
                ? "Anda tidak memiliki akses ke halaman ini."
                : error.message}
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={onRetry}>
            Coba lagi
          </Button>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <div
            className={isFetching ? "opacity-60 transition-opacity" : undefined}
          >
            <DataTable
              table={table}
              caption="Events"
              emptyMessage="Belum ada Event."
              className="min-w-[52rem]"
            />
          </div>
          <TablePagination
            paginationAtom={paginationAtom}
            total={total}
            isFetching={isFetching}
            variant="full"
            itemLabel="Event"
          />
        </div>
      )}

      <EventDetailSheet
        eventId={selectedEventId}
        open={selectedEventId !== null}
        canAcknowledge={canAcknowledge}
        canResolve={canResolve}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEventId(null)
          }
        }}
      />
    </div>
  )
}
