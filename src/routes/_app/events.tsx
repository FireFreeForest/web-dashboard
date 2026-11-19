import { createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import type { ColumnFiltersState, PaginationState } from "@tanstack/react-table"

import { EventsTable } from "@/components/events/events-table"
import { useMe } from "@/features/auth/queries"
import { useDevices } from "@/features/devices/queries"
import { useEvents } from "@/features/events/queries"
import type { EventStatus, EventType, Severity } from "@/features/events/types"
import { ApiError } from "@/lib/api/types"

export const Route = createFileRoute("/_app/events")({
  staticData: { crumb: "Events" },
  component: EventsPage,
})

function EventsPage() {
  const { data: user } = useMe()
  const { data: devicesData } = useDevices({ per_page: 100 })
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const columnFiltersAtom = useCreateAtom<ColumnFiltersState>([])
  const pagination = useSelector(paginationAtom)
  const columnFilters = useSelector(columnFiltersAtom)

  const getFilter = (id: string) =>
    columnFilters.find((filter) => filter.id === id)?.value as
      string | undefined

  const query = useEvents({
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    severity: getFilter("severity") as Severity | undefined,
    status: getFilter("status") as EventStatus | undefined,
    event_type: getFilter("event_type") as EventType | undefined,
    device_id: getFilter("device_id"),
    from: getFilter("from"),
    to: getFilter("to"),
  })

  useEffect(() => {
    paginationAtom.set((state) => ({ ...state, pageIndex: 0 }))
  }, [columnFilters, paginationAtom])

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <header className="space-y-1">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Events
        </h1>
      </header>

      <EventsTable
        events={query.data?.data ?? []}
        total={query.data?.meta.total ?? 0}
        devices={devicesData?.data ?? []}
        paginationAtom={paginationAtom}
        columnFiltersAtom={columnFiltersAtom}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error instanceof ApiError ? query.error : null}
        onRetry={() => void query.refetch()}
        canAcknowledge={user?.role === "admin" || user?.role === "petugas"}
        canResolve={user?.role === "petugas"}
      />
    </div>
  )
}
