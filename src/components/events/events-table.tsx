import { useMemo, useState } from "react"
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import {
  useTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { TablePagination } from "@/components/data-table/table-pagination"
import { EventDetailSheet } from "@/components/events/event-detail-sheet"
import {
  EVENT_TYPE_LABEL,
  formatTimestamp,
  SeverityBadge,
  StatusBadge,
} from "@/components/events/event-ui"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useMe } from "@/features/auth/queries"
import { useEvents } from "@/features/events/queries"
import type { Event, EventStatus, Severity } from "@/features/events/types"
import { paginationTableFeatures } from "@/lib/data-table/features"

export function EventsTable() {
  const { data: user } = useMe()
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const pagination = useSelector(paginationAtom)
  const [severity, setSeverity] = useState<Severity | "all">("all")
  const [status, setStatus] = useState<EventStatus | "all">("all")
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const query = useEvents({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    severity: severity === "all" ? undefined : severity,
    status: status === "all" ? undefined : status,
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

  const handleSeverityChange = (value: Severity | "all") => {
    setSeverity(value)
    resetPage()
  }

  const handleStatusChange = (value: EventStatus | "all") => {
    setStatus(value)
    resetPage()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={severity}
          onValueChange={(value) =>
            handleSeverityChange((value ?? "all") as Severity | "all")
          }
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua severity</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(value) =>
            handleStatusChange((value ?? "all") as EventStatus | "all")
          }
        >
          <SelectTrigger size="sm" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
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
