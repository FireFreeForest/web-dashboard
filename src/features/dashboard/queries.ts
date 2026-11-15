import { queryOptions, useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"

import type { DashboardSummary } from "./types"

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardKeys.all, "summary"] as const,
}

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch<DashboardSummary>({ url: "/dashboard/summary" })
}

export function dashboardSummaryQueryOptions() {
  return queryOptions({
    queryKey: dashboardKeys.summary(),
    queryFn: getDashboardSummary,
  })
}

export function useDashboardSummary() {
  return useQuery(dashboardSummaryQueryOptions())
}
