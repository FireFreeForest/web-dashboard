import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type TableFeatures,
} from "@tanstack/react-table"

export const sortingFeatures = {
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    datetime: sortFn_datetime,
    text: sortFn_text,
  },
} satisfies TableFeatures

export const searchFeatures = {
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
  },
} satisfies TableFeatures

export const paginationFeatures = {
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
} satisfies TableFeatures

export const dataTableFeatures = tableFeatures({
  ...sortingFeatures,
  ...searchFeatures,
  ...paginationFeatures,
})

export const searchPaginationTableFeatures = tableFeatures({
  ...searchFeatures,
  ...paginationFeatures,
})

export const paginationTableFeatures = tableFeatures({
  ...paginationFeatures,
})
