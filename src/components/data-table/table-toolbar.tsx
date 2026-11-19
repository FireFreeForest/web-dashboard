import { TableSearch } from "@/components/data-table/table-search"

export function TableToolbar({
  search,
  onSearchChange,
  placeholder = "Cari...",
  actions,
  className,
}: {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <TableSearch
        value={search}
        onValueChange={onSearchChange}
        placeholder={placeholder}
      />
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
