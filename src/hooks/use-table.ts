'use client'

import { useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  FilterFn,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  TableState,
  VisibilityState,
  useReactTable,
} from '@tanstack/react-table'
import { fuzzyFilter } from '@/lib/table'

interface DataTableProps<TData, TValue> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  type?: 'table' | 'card'
  columnsToPinLeft?: string[]
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string
  state?: Partial<TableState>
}

export default function useTable<TData, TValue>({
  columns,
  data,
  columnsToPinLeft = [],
  getRowId,
  state,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: columnsToPinLeft,
  })
  const [globalFilter, setGlobalFilter] = useState<string | number>('')
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    globalFilterFn: fuzzyFilter as FilterFn<TData>,
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
