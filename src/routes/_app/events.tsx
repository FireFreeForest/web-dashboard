import { useEffect, useMemo } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import type { ColumnFiltersState, PaginationState } from "@tanstack/react-table"

import { EventsTable } from "@/components/events/events-table"
import { useEvents } from "@/features/events/queries"
import type { EventStatus, EventType, Severity } from "@/features/events/types"
import { ApiError } from "@/lib/api/types"
import { pageTitle } from "@/lib/site"

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 20
const MAX_PER_PAGE = 100

const VALID_SEVERITIES: Severity[] = ["error", "warning", "critical"]
const VALID_STATUSES: EventStatus[] = ["active", "acknowledged", "resolved"]
const VALID_EVENT_TYPES: EventType[] = [
  "FIRE_DETECTED",
  "SMOKE_DETECTED",
  "TEMPERATURE_HIGH",
  "SOIL_DRY",
  "DEVICE_OFFLINE",
  "SENSOR_ERROR",
]

type EventSearch = {
  page: number
  per_page: number
  severity?: Severity
  status?: EventStatus
  event_type?: EventType
  device_id?: string
  from?: string
  to?: string
}

function parsePositiveInt(
  value: unknown,
  fallback: number,
  max = Number.POSITIVE_INFINITY
): number {
  const next = typeof value === "number" ? value : Number(value)

  if (!Number.isInteger(next) || next < 1 || next > max) {
    return fallback
  }

  return next
}

function parseEnum<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | undefined {
  return typeof value === "string" && allowed.includes(value as T)
    ? (value as T)
    : undefined
}

function parseString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function validateSearch(search: Record<string, unknown>): EventSearch {
  return {
    page: parsePositiveInt(search.page, DEFAULT_PAGE),
    per_page: parsePositiveInt(search.per_page, DEFAULT_PER_PAGE, MAX_PER_PAGE),
    severity: parseEnum(search.severity, VALID_SEVERITIES),
    status: parseEnum(search.status, VALID_STATUSES),
    event_type: parseEnum(search.event_type, VALID_EVENT_TYPES),
    device_id: parseString(search.device_id),
    from: parseString(search.from),
    to: parseString(search.to),
  }
}

export const Route = createFileRoute("/_app/events")({
  staticData: { crumb: "Events" },
  validateSearch,
  head: () => ({
    meta: [{ title: pageTitle("Events") }],
  }),
  component: EventsPage,
})

function toPaginationState(search: EventSearch): PaginationState {
  return {
    pageIndex: search.page - 1,
    pageSize: search.per_page,
  }
}

function toColumnFilters(search: EventSearch): ColumnFiltersState {
  const filters: ColumnFiltersState = []

  if (search.severity) filters.push({ id: "severity", value: search.severity })
  if (search.status) filters.push({ id: "status", value: search.status })
  if (search.event_type) {
    filters.push({ id: "event_type", value: search.event_type })
  }
  if (search.device_id) {
    filters.push({ id: "device_id", value: search.device_id })
  }
  if (search.from) filters.push({ id: "from", value: search.from })
  if (search.to) filters.push({ id: "to", value: search.to })

  return filters
}

function toSearch(
  pagination: PaginationState,
  filters: ColumnFiltersState
): EventSearch {
  const getFilter = (id: string) =>
    filters.find((filter) => filter.id === id)?.value as string | undefined

  return {
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
    severity: getFilter("severity") as Severity | undefined,
    status: getFilter("status") as EventStatus | undefined,
    event_type: getFilter("event_type") as EventType | undefined,
    device_id: getFilter("device_id"),
    from: getFilter("from"),
    to: getFilter("to"),
  }
}

function searchKey(search: EventSearch): string {
  return JSON.stringify(search)
}

function EventsPage() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const paginationAtom = useCreateAtom<PaginationState>(
    toPaginationState(search)
  )
  const columnFiltersAtom = useCreateAtom<ColumnFiltersState>(
    toColumnFilters(search)
  )
  const pagination = useSelector(paginationAtom)
  const columnFilters = useSelector(columnFiltersAtom)

  const query = useEvents(toSearch(pagination, columnFilters))
  const currentSearchKey = useMemo(() => searchKey(search), [search])

  useEffect(() => {
    const next = toPaginationState(search)
    const current = paginationAtom.get()

    if (
      current.pageIndex !== next.pageIndex ||
      current.pageSize !== next.pageSize
    ) {
      paginationAtom.set(next)
    }
  }, [search, paginationAtom])

  useEffect(() => {
    const next = toColumnFilters(search)
    const current = columnFiltersAtom.get()

    if (JSON.stringify(current) !== JSON.stringify(next)) {
      columnFiltersAtom.set(next)
    }
  }, [search, columnFiltersAtom])

  useEffect(() => {
    const next = toSearch(pagination, columnFilters)

    if (searchKey(next) === currentSearchKey) {
      return
    }

    void navigate({ search: next, replace: true })
  }, [pagination, columnFilters, currentSearchKey, navigate])

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
        paginationAtom={paginationAtom}
        columnFiltersAtom={columnFiltersAtom}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error instanceof ApiError ? query.error : null}
        onRetry={() => void query.refetch()}
      />
    </div>
  )
}
