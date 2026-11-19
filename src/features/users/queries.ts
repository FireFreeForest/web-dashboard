import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query"

import { apiFetchList } from "@/lib/api/client"

import type { ListUsersParams, ListUsersResult } from "./types"

export const userKeys = {
  all: ["users"] as const,
  list: (params: ListUsersParams) =>
    [...userKeys.all, "list", params.page, params.perPage, params.q] as const,
}

export function getUsers(params: ListUsersParams): Promise<ListUsersResult> {
  return apiFetchList({
    method: "GET",
    url: "/users",
    params: {
      page: params.page,
      per_page: params.perPage,
      q: params.q || undefined,
    },
  })
}

export function usersQueryOptions(params: ListUsersParams) {
  return queryOptions({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  })
}

export function useUsers(params: ListUsersParams) {
  return useQuery(usersQueryOptions(params))
}
