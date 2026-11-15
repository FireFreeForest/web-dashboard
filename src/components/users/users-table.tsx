import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Edit02Icon,
  MoreHorizontalCircle01Icon,
  UserBlock01Icon,
  UserCheck01Icon,
} from "@hugeicons/core-free-icons"
import { useSelector, type Atom } from "@tanstack/react-store"
import {
  useTable,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table"
import { toast } from "sonner"

import { DataTable } from "@/components/data-table/data-table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { paginationTableFeatures } from "@/lib/data-table/features"
import { DeactivateUserDialog } from "@/components/users/deactivate-user-dialog"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import { UserRoleBadge } from "@/components/users/user-role-badge"
import { UserStatusBadge } from "@/components/users/user-status-badge"
import { useUpdateUser } from "@/features/users/mutations"
import type { User } from "@/features/users/types"
import { ApiError } from "@/lib/api/types"
import { getInitials } from "@/lib/user"

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
})

export function UsersTable({
  users,
  total,
  paginationAtom,
  isLoading,
  isFetching,
  error,
  onRetry,
  currentUserId,
}: {
  users: User[]
  total: number
  paginationAtom: Atom<PaginationState>
  isLoading: boolean
  isFetching: boolean
  error: ApiError | null
  onRetry: () => void
  currentUserId?: string
}) {
  const pagination = useSelector(paginationAtom)
  const updateUser = useUpdateUser()
  const { mutateAsync: updateUserAsync } = updateUser
  const [editing, setEditing] = React.useState<User | null>(null)
  const [editOpen, setEditOpen] = React.useState(false)
  const [deactivating, setDeactivating] = React.useState<User | null>(null)

  const openEdit = React.useCallback((user: User) => {
    setEditing(user)
    setEditOpen(true)
  }, [])

  const openDeactivate = React.useCallback((user: User) => {
    setDeactivating(user)
  }, [])

  const handleActivate = React.useCallback(
    async (user: User) => {
      try {
        await updateUserAsync({ id: user.id, is_active: true })
        toast.success("User diaktifkan kembali.")
      } catch (mutationError) {
        if (mutationError instanceof ApiError) {
          toast.error(mutationError.message)
          return
        }
        toast.error("Terjadi kesalahan tidak terduga.")
      }
    },
    [updateUserAsync]
  )

  const columns = React.useMemo<
    Array<ColumnDef<typeof paginationTableFeatures, User>>
  >(
    () => [
      {
        accessorKey: "name",
        header: "User",
        cell: ({ row }) => {
          const user = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {getInitials(user.name || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{user.name || user.email}</span>
                {user.name ? (
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                ) : null}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => <UserStatusBadge active={row.original.is_active} />,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
          const date = new Date(row.original.created_at)
          return (
            <span className="text-muted-foreground">
              {Number.isNaN(date.getTime())
                ? row.original.created_at
                : dateFormatter.format(date)}
            </span>
          )
        },
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const user = row.original
          const isSelf = user.id === currentUserId

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${user.email}`}
                    />
                  }
                >
                  <HugeiconsIcon
                    icon={MoreHorizontalCircle01Icon}
                    strokeWidth={2}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(user)}>
                    <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user.is_active ? (
                    <DropdownMenuItem
                      variant="destructive"
                      disabled={isSelf}
                      onClick={() => openDeactivate(user)}
                    >
                      <HugeiconsIcon icon={UserBlock01Icon} strokeWidth={2} />
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      disabled={updateUser.isPending}
                      onClick={() => handleActivate(user)}
                    >
                      <HugeiconsIcon icon={UserCheck01Icon} strokeWidth={2} />
                      Activate
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [
      currentUserId,
      handleActivate,
      openDeactivate,
      openEdit,
      updateUser.isPending,
    ]
  )

  const table = useTable(
    {
      features: paginationTableFeatures,
      columns,
      data: users,
      getRowId: (user) => user.id,
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
              <HugeiconsIcon icon={UserBlock01Icon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Gagal memuat user</EmptyTitle>
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
            caption="Users"
            emptyMessage="Belum ada user."
          />
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span>
            {total === 0
              ? "0 user"
              : `${rangeStart}-${rangeEnd} dari ${total} user`}
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

      <EditUserDialog
        user={editing}
        open={editOpen}
        onOpenChange={setEditOpen}
        isSelf={editing?.id === currentUserId}
      />
      <DeactivateUserDialog
        user={deactivating}
        open={deactivating !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeactivating(null)
          }
        }}
      />
    </div>
  )
}
