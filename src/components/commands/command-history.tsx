import type { ComponentProps } from "react"
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import {
  useTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { TablePagination } from "@/components/data-table/table-pagination"
import { IssueCommandDialog } from "@/components/commands/issue-command-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeviceCommands } from "@/features/commands/queries"
import type { Command, CommandStatus } from "@/features/commands/types"
import { paginationTableFeatures } from "@/lib/data-table/features"

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "medium",
})

function formatTimestamp(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

const statusMeta: Record<
  CommandStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Pending", variant: "secondary" },
  sent: { label: "Terkirim", variant: "secondary" },
  success: { label: "Sukses", variant: "default" },
  failed: { label: "Gagal", variant: "destructive" },
  timeout: { label: "Timeout", variant: "outline" },
}

const commandColumns: Array<
  ColumnDef<typeof paginationTableFeatures, Command>
> = [
  {
    accessorKey: "issued_at",
    header: "Waktu",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatTimestamp(row.original.issued_at)}
      </span>
    ),
  },
  {
    id: "pump",
    header: "Pompa",
    cell: ({ row }) => {
      const state = row.original.payload.state
      return (
        <Badge variant={state ? "secondary" : "outline"}>
          {state ? "On" : "Off"}
        </Badge>
      )
    },
  },
  {
    id: "duration",
    header: "Durasi",
    cell: ({ row }) => {
      const { state, duration } = row.original.payload
      return (
        <span className="tabular-nums">{state ? `${duration}s` : "—"}</span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const meta = statusMeta[row.original.status]
      return <Badge variant={meta.variant}>{meta.label}</Badge>
    },
  },
]

export function CommandHistoryPanel({
  deviceId,
  canIssue,
}: {
  deviceId: string
  canIssue: boolean
}) {
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const pagination = useSelector(paginationAtom)
  const query = useDeviceCommands(deviceId, {
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  })

  const data = query.data?.data ?? []
  const total = query.data?.meta.total ?? 0

  const table = useTable(
    {
      features: paginationTableFeatures,
      columns: commandColumns,
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

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Riwayat Command</span>
        {canIssue ? <IssueCommandDialog deviceId={deviceId} /> : null}
      </div>

      {query.isLoading ? (
        <Skeleton className="h-40 w-full rounded-2xl" />
      ) : query.error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl p-4 text-center ring-1 ring-foreground/10">
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
        <div className="flex flex-col gap-3">
          <div
            className={
              query.isFetching ? "opacity-60 transition-opacity" : undefined
            }
          >
            <DataTable
              table={table}
              caption="Riwayat command"
              emptyMessage="Belum ada command."
            />
          </div>
          <TablePagination
            paginationAtom={paginationAtom}
            total={total}
            isFetching={query.isFetching}
          />
        </div>
      )}
    </div>
  )
}
