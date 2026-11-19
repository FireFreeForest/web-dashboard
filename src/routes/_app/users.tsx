import { createFileRoute, redirect } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import type { PaginationState } from "@tanstack/react-table"

import { CreateUserDialog } from "@/components/users/create-user-dialog"
import { UsersTable } from "@/components/users/users-table"
import { meQueryOptions, useMe } from "@/features/auth/queries"
import { useUsers } from "@/features/users/queries"
import { ApiError } from "@/lib/api/types"
import { useDebouncedValue } from "@/hooks/use-debounced-value"

type UsersBeforeLoadContext = {
  context: { queryClient: QueryClient }
}

export const Route = createFileRoute("/_app/users")({
  staticData: { crumb: "Users" },
  beforeLoad: async ({ context }: UsersBeforeLoadContext) => {
    const user = await context.queryClient.ensureQueryData(meQueryOptions())

    if (user.role !== "admin") {
      throw redirect({ to: "/" })
    }
  },
  component: UsersPage,
})

function UsersPage() {
  const { data: currentUser } = useMe()
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const pagination = useSelector(paginationAtom)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const query = useUsers({
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
    q: debouncedSearch || undefined,
  })

  useEffect(() => {
    paginationAtom.set((state) => ({ ...state, pageIndex: 0 }))
  }, [debouncedSearch, paginationAtom])

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Users
      </h1>

      <UsersTable
        users={query.data?.data ?? []}
        total={query.data?.meta.total ?? 0}
        paginationAtom={paginationAtom}
        search={search}
        onSearchChange={setSearch}
        isSearching={debouncedSearch.length > 0}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error instanceof ApiError ? query.error : null}
        onRetry={() => void query.refetch()}
        currentUserId={currentUser?.id}
        actions={<CreateUserDialog />}
      />
    </div>
  )
}
