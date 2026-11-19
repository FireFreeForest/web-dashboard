import { cn } from "@/lib/utils"

import { TableSearch } from "@/components/data-table/table-search"

export function TableToolbar({
  leading,
  search = "",
  onSearchChange,
  placeholder = "Cari...",
  actions,
  className,
}: {
  leading?: React.ReactNode
  search?: string
  onSearchChange?: (value: string) => void
  placeholder?: string
  actions?: React.ReactNode
  className?: string
}) {
  const showSearch = typeof onSearchChange === "function"

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {showSearch ? (
        <TableSearch
          value={search}
          onValueChange={onSearchChange}
          placeholder={placeholder}
        />
      ) : (
        (leading ?? null)
      )}
      {actions ? (
        <div className="flex items-center justify-end gap-2 max-sm:w-full sm:ml-auto">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
