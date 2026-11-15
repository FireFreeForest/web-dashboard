import { useState } from "react"
import type { Atom } from "@tanstack/react-store"
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import {
  useTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useEnvironmentTelemetry,
  useFireTelemetry,
} from "@/features/telemetry/queries"
import type {
  EnvironmentTelemetry,
  FireTelemetry,
} from "@/features/telemetry/types"
import { paginationTableFeatures } from "@/lib/data-table/features"
import { cn } from "@/lib/utils"

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "medium",
})

function formatTimestamp(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : dateTimeFormatter.format(date)
}

const environmentColumns: Array<
  ColumnDef<typeof paginationTableFeatures, EnvironmentTelemetry>
> = [
  {
    accessorKey: "recorded_at",
    header: "Waktu",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatTimestamp(row.original.recorded_at)}
      </span>
    ),
  },
  {
    accessorKey: "temperature",
    header: "Suhu",
    cell: ({ row }) => {
      const value = row.original.temperature
      return (
        <span className="tabular-nums">
          {value != null ? `${value.toFixed(1)}°C` : "—"}
        </span>
      )
    },
  },
  {
    accessorKey: "humidity",
    header: "Kelembapan",
    cell: ({ row }) => {
      const value = row.original.humidity
      return (
        <span className="tabular-nums">
          {value != null ? `${value}%` : "—"}
        </span>
      )
    },
  },
  {
    accessorKey: "soil_moisture",
    header: "Tanah",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.soil_moisture}</span>
    ),
  },
]

const fireColumns: Array<
  ColumnDef<typeof paginationTableFeatures, FireTelemetry>
> = [
  {
    accessorKey: "recorded_at",
    header: "Waktu",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {formatTimestamp(row.original.recorded_at)}
      </span>
    ),
  },
  {
    accessorKey: "flame_detected",
    header: "Api",
    cell: ({ row }) => (
      <Badge
        variant={row.original.flame_detected ? "destructive" : "secondary"}
      >
        {row.original.flame_detected ? "Terdeteksi" : "Aman"}
      </Badge>
    ),
  },
  {
    accessorKey: "flame_level",
    header: "Level Api",
    cell: ({ row }) => (
      <span className="tabular-nums">
        {row.original.flame_level != null ? row.original.flame_level : "—"}
      </span>
    ),
  },
  {
    accessorKey: "smoke_level",
    header: "Level Asap",
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.smoke_level}</span>
    ),
  },
  {
    accessorKey: "pump",
    header: "Pompa",
    cell: ({ row }) => (
      <Badge variant={row.original.pump ? "secondary" : "outline"}>
        {row.original.pump ? "On" : "Off"}
      </Badge>
    ),
  },
  {
    accessorKey: "buzzer",
    header: "Buzzer",
    cell: ({ row }) => (
      <Badge variant={row.original.buzzer ? "secondary" : "outline"}>
        {row.original.buzzer ? "On" : "Off"}
      </Badge>
    ),
  },
]

function TelemetryPagination({
  paginationAtom,
  total,
  isFetching,
}: {
  paginationAtom: Atom<PaginationState>
  total: number
  isFetching: boolean
}) {
  const pagination = useSelector(paginationAtom)
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize))
  const pageIndex = pagination.pageIndex

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">
        Page {pageIndex + 1} of {pageCount}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            paginationAtom.set((state) => ({
              ...state,
              pageIndex: state.pageIndex - 1,
            }))
          }
          disabled={pageIndex <= 0 || isFetching}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            paginationAtom.set((state) => ({
              ...state,
              pageIndex: state.pageIndex + 1,
            }))
          }
          disabled={pageIndex + 1 >= pageCount || isFetching}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

function EnvironmentHistoryTable({ deviceId }: { deviceId: string }) {
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const pagination = useSelector(paginationAtom)
  const query = useEnvironmentTelemetry(deviceId, {
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  })

  const data = query.data?.data ?? []
  const total = query.data?.meta.total ?? 0

  const table = useTable(
    {
      features: paginationTableFeatures,
      columns: environmentColumns,
      data,
      getRowId: (row) => String(row.id),
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

  if (query.isLoading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />
  }

  if (query.error) {
    return (
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
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={
          query.isFetching ? "opacity-60 transition-opacity" : undefined
        }
      >
        <DataTable
          table={table}
          caption="Riwayat lingkungan"
          emptyMessage="Belum ada data."
        />
      </div>
      <TelemetryPagination
        paginationAtom={paginationAtom}
        total={total}
        isFetching={query.isFetching}
      />
    </div>
  )
}

function FireHistoryTable({ deviceId }: { deviceId: string }) {
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const pagination = useSelector(paginationAtom)
  const query = useFireTelemetry(deviceId, {
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  })

  const data = query.data?.data ?? []
  const total = query.data?.meta.total ?? 0

  const table = useTable(
    {
      features: paginationTableFeatures,
      columns: fireColumns,
      data,
      getRowId: (row) => String(row.id),
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

  if (query.isLoading) {
    return <Skeleton className="h-40 w-full rounded-2xl" />
  }

  if (query.error) {
    return (
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
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={
          query.isFetching ? "opacity-60 transition-opacity" : undefined
        }
      >
        <DataTable
          table={table}
          caption="Riwayat api/asap"
          emptyMessage="Belum ada data."
        />
      </div>
      <TelemetryPagination
        paginationAtom={paginationAtom}
        total={total}
        isFetching={query.isFetching}
      />
    </div>
  )
}

export function TelemetryHistoryPanel({ deviceId }: { deviceId: string }) {
  const [kind, setKind] = useState<"environment" | "fire">("environment")

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Riwayat Telemetri</span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={kind === "environment" ? "secondary" : "ghost"}
            className={cn(kind !== "environment" && "text-muted-foreground")}
            onClick={() => setKind("environment")}
          >
            Lingkungan
          </Button>
          <Button
            size="sm"
            variant={kind === "fire" ? "secondary" : "ghost"}
            className={cn(kind !== "fire" && "text-muted-foreground")}
            onClick={() => setKind("fire")}
          >
            Api & Asap
          </Button>
        </div>
      </div>

      {kind === "environment" ? (
        <EnvironmentHistoryTable deviceId={deviceId} />
      ) : (
        <FireHistoryTable deviceId={deviceId} />
      )}
    </div>
  )
}
