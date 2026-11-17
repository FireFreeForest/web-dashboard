import type {
  ReactTable,
  RowData,
  TableFeatures,
  TableState,
} from "@tanstack/react-table"
import { cn } from "cn"

export type DataTableProps<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TSelected = TableState<TFeatures>,
> = {
  table: ReactTable<TFeatures, TData, TSelected>
  caption?: string
  emptyMessage?: React.ReactNode
  className?: string
  containerClassName?: string
}

export function DataTable<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TSelected = TableState<TFeatures>,
>({
  table,
  caption,
  emptyMessage = "Belum ada data.",
  className,
  containerClassName,
}: DataTableProps<TFeatures, TData, TSelected>) {
  const rows = table.getRowModel().rows
  const columnCount = Math.max(1, table.getAllLeafColumns().length)

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl bg-card ring-1 ring-foreground/10",
        containerClassName
      )}
    >
      <table
        className={cn("w-full border-collapse text-left text-sm", className)}
      >
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-border/60 bg-muted/40">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="px-4 py-3 font-medium text-muted-foreground"
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border/40 last:border-0 hover:bg-muted/30"
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columnCount}
                className="px-4 py-10 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
