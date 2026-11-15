import { queryOptions, useQuery } from "@tanstack/react-query"

import { apiFetch } from "@/lib/api/client"

import { hasSession } from "./token-storage"
import type { User } from "./types"

export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
}

export function getMe(): Promise<User> {
  return apiFetch<User>({ url: "/auth/me" })
}

export function meQueryOptions() {
  return queryOptions({
    queryKey: authKeys.me(),
    queryFn: getMe,
    staleTime: 5 * 60_000,
    retry: false,
    enabled: hasSession(),
  })
}

export function useMe() {
  return useQuery(meQueryOptions())
}
