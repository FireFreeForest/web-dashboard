import type { Atom } from "@tanstack/react-store"
import { useSelector } from "@tanstack/react-store"
import type { PaginationState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

export function TablePagination({
  paginationAtom,
  total,
  isFetching,
}: {
  paginationAtom: Atom<PaginationState>
  total: number
  isFetching: boolean
}) {
  const pagination = useSelector(paginationAtom)
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize))
  const pageIndex = pagination.pageIndex

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">
        Page {pageIndex + 1} of {pageCount}
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            paginationAtom.set((state) => ({
              ...state,
              pageIndex: state.pageIndex - 1,
            }))
          }
          disabled={pageIndex <= 0 || isFetching}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            paginationAtom.set((state) => ({
              ...state,
              pageIndex: state.pageIndex + 1,
            }))
          }
          disabled={pageIndex + 1 >= pageCount || isFetching}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
