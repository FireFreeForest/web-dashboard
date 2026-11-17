import { createFileRoute } from "@tanstack/react-router"
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import type { PaginationState } from "@tanstack/react-table"

import { CreateDeviceDialog } from "@/components/devices/create-device-dialog"
import { DevicesTable } from "@/components/devices/devices-table"
import { useMe } from "@/features/auth/queries"
import { useDevices } from "@/features/devices/queries"
import { ApiError } from "@/lib/api/types"

export const Route = createFileRoute("/_app/nodes")({
  staticData: { crumb: "Device" },
  component: NodesPage,
})

function NodesPage() {
  const { data: user } = useMe()
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const pagination = useSelector(paginationAtom)
  const query = useDevices({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  })

  const devices = query.data?.data ?? []
  const total = query.data?.meta.total ?? 0
  const isAdmin = user?.role === "admin"

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Device
          </h1>
        </div>
        {isAdmin ? <CreateDeviceDialog /> : null}
      </header>

      <DevicesTable
        devices={devices}
        total={total}
        paginationAtom={paginationAtom}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error instanceof ApiError ? query.error : null}
        onRetry={() => void query.refetch()}
        canEdit={isAdmin}
      />
    </div>
  )
}
