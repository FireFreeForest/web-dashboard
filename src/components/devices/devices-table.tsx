import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Edit02Icon,
  EyeIcon,
  MoreHorizontalCircle01Icon,
  ServerStackIcon,
} from "@hugeicons/core-free-icons"
import { useSelector, type Atom } from "@tanstack/react-store"
import { Link } from "@tanstack/react-router"
import {
  useTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { DeleteDeviceDialog } from "@/components/devices/delete-device-dialog"
import { DeviceStatusPill } from "@/components/devices/device-ui"
import { EditDeviceDialog } from "@/components/devices/edit-device-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import type { Device } from "@/features/devices/types"
import { paginationTableFeatures } from "@/lib/data-table/features"
import { ApiError } from "@/lib/api/types"
import { formatDateTime } from "@/lib/utils"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function DevicesTable({
  devices,
  total,
  paginationAtom,
  isLoading,
  isFetching,
  error,
  onRetry,
  canEdit,
}: {
  devices: Device[]
  total: number
  paginationAtom: Atom<PaginationState>
  isLoading: boolean
  isFetching: boolean
  error: ApiError | null
  onRetry: () => void
  canEdit: boolean
}) {
  const pagination = useSelector(paginationAtom)
  const [editingDevice, setEditingDevice] = React.useState<Device | null>(null)
  const [deletingDevice, setDeletingDevice] = React.useState<Device | null>(
    null
  )

  const columns = React.useMemo<
    Array<ColumnDef<typeof paginationTableFeatures, Device>>
  >(
    () => [
      {
        accessorKey: "name",
        header: "Node",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "device_id",
        header: "Node ID",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.device_id}
          </span>
        ),
      },
      {
        accessorKey: "location_name",
        header: "Lokasi",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.location_name || "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <DeviceStatusPill status={row.original.status} />,
      },
      {
        accessorKey: "last_seen_at",
        header: "Last seen",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-muted-foreground">
            {formatDateTime(row.original.last_seen_at)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const device = row.original

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${device.name}`}
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={MoreHorizontalCircle01Icon}
                    strokeWidth={2}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    render={
                      <Link
                        to="/nodes/$deviceId"
                        params={{ deviceId: device.device_id }}
                      />
                    }
                  >
                    <HugeiconsIcon icon={EyeIcon} strokeWidth={2} />
                    Detail
                  </DropdownMenuItem>
                  {canEdit ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => setEditingDevice(device)}
                      >
                        <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingDevice(device)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
                        Hapus
                      </DropdownMenuItem>
                    </>
                  ) : null}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [canEdit]
  )

  const table = useTable(
    {
      features: paginationTableFeatures,
      columns,
      data: devices,
      getRowId: (device) => device.id,
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

  const pageCount = table.getPageCount() || 1
  const pageIndex = pagination.pageIndex
  const rangeStart = total === 0 ? 0 : pageIndex * pagination.pageSize + 1
  const rangeEnd = Math.min((pageIndex + 1) * pagination.pageSize, total)

  const handlePageSizeChange = (value: string) => {
    const pageSize = Number(value)
    paginationAtom.set(() => ({ pageIndex: 0, pageSize }))
  }

  const handlePageChange = (nextPageIndex: number) => {
    paginationAtom.set((state) => ({
      ...state,
      pageIndex: nextPageIndex,
    }))
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : error ? (
        <Empty className="rounded-2xl ring-1 ring-foreground/10">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={ServerStackIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Gagal memuat perangkat</EmptyTitle>
            <EmptyDescription>
              {error.code === "forbidden"
                ? "Anda tidak memiliki akses ke halaman ini."
                : error.message}
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        </Empty>
      ) : (
        <div
          className={isFetching ? "opacity-60 transition-opacity" : undefined}
        >
          <DataTable
            table={table}
            caption="Nodes"
            emptyMessage="Belum ada node."
          />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            {total === 0
              ? "0 node"
              : `${rangeStart}-${rangeEnd} dari ${total} node`}
          </span>
          <div className="flex items-center gap-2">
            <span>Rows</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => handlePageSizeChange(value as string)}
            >
              <SelectTrigger size="sm" className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <span className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageIndex - 1)}
            disabled={pageIndex <= 0 || isFetching}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageIndex + 1)}
            disabled={pageIndex + 1 >= pageCount || isFetching}
          >
            Next
          </Button>
        </div>
      </div>

      <EditDeviceDialog
        device={editingDevice}
        open={editingDevice !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingDevice(null)
          }
        }}
      />
      <DeleteDeviceDialog
        device={deletingDevice}
        open={deletingDevice !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingDevice(null)
          }
        }}
      />
    </div>
  )
}
