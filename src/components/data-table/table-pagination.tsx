import type { Atom } from "@tanstack/react-store"
import { useSelector } from "@tanstack/react-store"
import type { PaginationState } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

export function TablePagination({
  paginationAtom,
  total,
  isFetching,
  variant = "compact",
  itemLabel = "item",
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: {
  paginationAtom: Atom<PaginationState>
  total: number
  isFetching: boolean
  variant?: "compact" | "full"
  itemLabel?: string
  pageSizeOptions?: number[]
}) {
  const pagination = useSelector(paginationAtom)
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize))
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

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          Halaman {pageIndex + 1} dari {pageCount}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageIndex - 1)}
            disabled={pageIndex <= 0 || isFetching}
          >
            Sebelumnya
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageIndex + 1)}
            disabled={pageIndex + 1 >= pageCount || isFetching}
          >
            Berikutnya
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span>
          {total === 0
            ? `0 ${itemLabel}`
            : `${rangeStart}-${rangeEnd} dari ${total} ${itemLabel}`}
        </span>
        <div className="flex items-center gap-2">
          <span>Baris</span>
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(value) => handlePageSizeChange(value as string)}
          >
            <SelectTrigger size="sm" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((option) => (
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
          Halaman {pageIndex + 1} dari {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pageIndex - 1)}
          disabled={pageIndex <= 0 || isFetching}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pageIndex + 1)}
          disabled={pageIndex + 1 >= pageCount || isFetching}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  )
}
