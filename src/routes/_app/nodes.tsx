import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import type { PaginationState } from "@tanstack/react-table"

import { CreateDeviceDialog } from "@/components/devices/create-device-dialog"
import { DevicesTable } from "@/components/devices/devices-table"
import { useMe } from "@/features/auth/queries"
import { useDevices } from "@/features/devices/queries"
import { ApiError } from "@/lib/api/types"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

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
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const query = useDevices({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    q: debouncedSearch || undefined,
  })

  useEffect(() => {
    paginationAtom.set((state) => ({ ...state, pageIndex: 0 }))
  }, [debouncedSearch, paginationAtom])

  const devices = query.data?.data ?? []
  const total = query.data?.meta.total ?? 0
  const isAdmin = user?.role === "admin"

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Device
      </h1>

      <DevicesTable
        devices={devices}
        total={total}
        paginationAtom={paginationAtom}
        search={search}
        onSearchChange={setSearch}
        isSearching={debouncedSearch.length > 0}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error instanceof ApiError ? query.error : null}
        onRetry={() => void query.refetch()}
        canEdit={isAdmin}
        actions={isAdmin ? <CreateDeviceDialog /> : null}
      />
    </div>
  )
}
