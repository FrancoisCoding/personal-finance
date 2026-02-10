'use client'

import { useEffect } from 'react'
import { useAtom } from 'jotai'
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  TableState,
  useReactTable,
} from '@tanstack/react-table'
import { fuzzyFilter } from '@/lib/table'
import {
  transactionsTableSortingAtom,
  transactionsTableFiltersAtom,
  transactionsTablePinningAtom,
  transactionsTableVisibilityAtom,
  transactionsTableGlobalFilterAtom,
  transactionsTableRowSelectionAtom,
  transactionsTablePaginationAtom,
} from '@/store/transactions-table-atoms'

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  columnsToPinLeft?: string[]
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
  state?: Partial<TableState>
}

export default function useTransactionsTable<TData, TValue>({
  columns,
  data,
  columnsToPinLeft = [],
  getRowId,
  state,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useAtom(transactionsTableSortingAtom)
  const [columnFilters, setColumnFilters] = useAtom(
    transactionsTableFiltersAtom
  )
  const [columnPinning, setColumnPinning] = useAtom(
    transactionsTablePinningAtom
  )
  const [columnVisibility, setColumnVisibility] = useAtom(
    transactionsTableVisibilityAtom
  )
  const [globalFilter, setGlobalFilter] = useAtom(
    transactionsTableGlobalFilterAtom
  )
  const [rowSelection, setRowSelection] = useAtom(
    transactionsTableRowSelectionAtom
  )
  const [pagination, setPagination] = useAtom(
    transactionsTablePaginationAtom
  )

  useEffect(() => {
    if (columnsToPinLeft.length > 0 && columnPinning.left?.length === 0) {
      setColumnPinning({
        ...columnPinning,
        left: columnsToPinLeft,
      })
    }
  }, [columnPinning, columnsToPinLeft, setColumnPinning])

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: 'fuzzy',
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnPinningChange: setColumnPinning,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getRowId,
    state: {
      sorting,
      columnFilters,
      columnPinning,
      columnVisibility,
      globalFilter,
      rowSelection,
      pagination,
      ...state,
    },
  })

  return {
    table,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    columnPinning,
    setColumnPinning,
    columnVisibility,
    setColumnVisibility,
    sorting,
    setSorting,
    rowSelection,
    setRowSelection,
    pagination,
    setPagination,
  }
}
