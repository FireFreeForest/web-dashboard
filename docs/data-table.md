# Data Table (TanStack Table V9)

Setup data table headless dengan TanStack Table V9. Semua state tabel dikelola TanStack Store. Komponen `DataTable` hanya merender elemen tabel semantik; kontrol fitur disusun di halaman yang memakai tabel.

## File

- `src/lib/data-table/features.ts` - preset feature stabil.
- `src/components/data-table/data-table.tsx` - renderer tabel generik.

Dependency:

```bash
bun add @tanstack/react-table@^9.3.1
```

## Feature Preset

`features.ts` menyediakan tiga potongan feature:

- `sortingFeatures` - sorting client-side, registry `alphanumeric`, `basic`, `datetime`, `text`.
- `searchFeatures` - column filtering, global filtering, registry `includesString`.
- `paginationFeatures` - pagination client-side.

Preset siap pakai:

- `dataTableFeatures` - sorting + search + pagination.
- `searchPaginationTableFeatures` - search + pagination saja.

Semua objek dibuat di module scope supaya referensinya stabil. Jangan membuat `tableFeatures(...)` di dalam component.

## Pemakaian Dasar

```tsx
import { useTable, type ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/data-table/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { dataTableFeatures } from "@/lib/data-table/features"

type Person = {
  id: string
  name: string
  age: number
}

const columns: Array<ColumnDef<typeof dataTableFeatures, Person>> = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <button
        type="button"
        onClick={column.getToggleSortingHandler()}
        className="inline-flex items-center gap-1"
      >
        Name
        {column.getIsSorted() === "asc"
          ? "↑"
          : column.getIsSorted() === "desc"
            ? "↓"
            : null}
      </button>
    ),
  },
  {
    accessorKey: "age",
    header: "Age",
    sortFn: "basic",
  },
]

export function PeopleTable({ data }: { data: Person[] }) {
  const table = useTable(
    {
      features: dataTableFeatures,
      columns,
      data,
      getRowId: (person) => person.id,
      initialState: {
        pagination: { pageIndex: 0, pageSize: 10 },
      },
    },
    (state) => ({
      globalFilter: state.globalFilter,
      pagination: state.pagination,
      sorting: state.sorting,
    })
  )

  return (
    <div className="space-y-4">
      <Input
        value={String(table.state.globalFilter ?? "")}
        onChange={(event) => table.setGlobalFilter(event.target.value)}
        placeholder="Search..."
        aria-label="Search people"
      />

      <DataTable table={table} caption="People" emptyMessage="No people." />

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Page {table.state.pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
```

`DataTable` menerima instance tabel dan tidak memanggil API fitur apa pun. Sorting, search, pagination, dan kontrol lain dibuat di komponen pemakai.

## Memilih Fitur

Pakai preset yang sudah tersedia:

```tsx
import { searchPaginationTableFeatures } from "@/lib/data-table/features"

const columns: Array<ColumnDef<typeof searchPaginationTableFeatures, Person>> =
  []

const table = useTable({
  features: searchPaginationTableFeatures,
  columns,
  data,
})
```

Atau komposisi sendiri dari preset:

```tsx
import { tableFeatures } from "@tanstack/react-table"

import {
  paginationFeatures,
  searchFeatures,
  sortingFeatures,
} from "@/lib/data-table/features"

export const peopleTableFeatures = tableFeatures({
  ...sortingFeatures,
  ...paginationFeatures,
})
```

Row model slot harus selalu ikut feature-nya:

- `sortedRowModel` butuh `rowSortingFeature`.
- `filteredRowModel` butuh `columnFilteringFeature`.
- `paginatedRowModel` butuh `rowPaginationFeature`.

## Reactive Read

Selector pada `useTable` menentukan state yang memicu render:

```tsx
const table = useTable(options, (state) => ({
  globalFilter: state.globalFilter,
  pagination: state.pagination,
  sorting: state.sorting,
}))
```

Untuk membaca nilai saat ini tanpa subscribe, gunakan atom:

```ts
const pagination = table.atoms.pagination.get()
```

Untuk membatasi render ke bagian tertentu, pakai `table.Subscribe`:

```tsx
<table.Subscribe selector={(state) => ({ pagination: state.pagination })}>
  {({ pagination }) => <span>Page {pagination.pageIndex + 1}</span>}
</table.Subscribe>
```

## External Atom

External atom hanya dipakai jika aplikasi harus memiliki slice tersebut, misalnya pagination masuk query key server.

```bash
bun add @tanstack/react-store@^0.11.2
```

```tsx
import { useCreateAtom, useSelector } from "@tanstack/react-store"
import { type PaginationState, useTable } from "@tanstack/react-table"

import { dataTableFeatures } from "@/lib/data-table/features"

const paginationAtom = useCreateAtom<PaginationState>({
  pageIndex: 0,
  pageSize: 10,
})

function usePeopleTable(data: Person[]) {
  const pagination = useSelector(paginationAtom)

  const table = useTable({
    features: dataTableFeatures,
    columns,
    data,
    atoms: {
      pagination: paginationAtom,
    },
  })

  return { pagination, table }
}
```

Jangan memberi slice yang sama lewat `atoms`, `state`, dan `initialState` sekaligus.

## Server-Side

Untuk pagination, sorting, atau filtering dari server, pasang opsi manual dan jangan andalkan row model client-side:

```tsx
const table = useTable(
  {
    features: dataTableFeatures,
    columns,
    data: query.data?.rows ?? [],
    rowCount: query.data?.rowCount,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    atoms: {
      pagination: paginationAtom,
      sorting: sortingAtom,
      columnFilters: columnFiltersAtom,
    },
  },
  (state) => ({
    columnFilters: state.columnFilters,
    pagination: state.pagination,
    sorting: state.sorting,
  })
)
```

Nilai atom bisa dipakai langsung di query key TanStack Query. External atom tetap opsional; pakai hanya untuk slice yang dipakai di luar tabel.

## URL Sync

Sinkronkan state ke URL hanya jika produk membutuhkan shareable/deep-linked state. Dengan TanStack Router, baca `validateSearch`, lalu jadikan search params sebagai sumber nilai atom atau controlled state tabel. Tidak ada URL sync otomatis di `DataTable`.

## Catatan

- Data lokal di browser: cukup `dataTableFeatures` atau `searchPaginationTableFeatures`.
- Data server: pakai external atom untuk slice yang masuk query key, plus opsi `manual*`.
- `DataTable` tidak menyediakan toolbar, pagination, atau sort button. Itu sengaja supaya fitur tetap opsional.
- Markup tabel memakai `table`, `caption`, `thead`, `th scope="col"`, `tbody`, dan `td`.
