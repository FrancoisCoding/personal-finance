'use client'

import { memo, useEffect, useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  ColumnSizingState,
  FilterFn,
  SortingState,
  Table as TableInstance,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreHorizontal,
} from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const PAGE_SIZE_10 = 10
const PAGE_SIZE_20 = 20
const PAGE_SIZE_50 = 50
const PAGE_SIZE_100 = 100
const DEFAULT_PAGE_SIZE = PAGE_SIZE_20
const DEFAULT_PAGE_SIZE_OPTIONS: readonly number[] = [
  PAGE_SIZE_10,
  PAGE_SIZE_20,
  PAGE_SIZE_50,
  PAGE_SIZE_100,
]
const MIN_ROW_HEIGHT = 40
const DEFAULT_ROW_HEIGHT = 60

const globalFilterFn: FilterFn<unknown> = (row, _columnId, filterValue) => {
  const searchValue = String(filterValue ?? '')
    .toLowerCase()
    .trim()

  if (!searchValue) {
    return true
  }

  return row.getAllCells().some((cell) => {
    const value = cell.getValue()
    if (value == null) {
      return false
    }

    let stringValue = ''
    if (typeof value === 'object') {
      try {
        stringValue = JSON.stringify(value)
      } catch {
        stringValue = ''
      }
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      stringValue = String(value)
    } else {
      stringValue = ''
    }

    return stringValue.toLowerCase().includes(searchValue)
  })
}

export interface TableProps<TData> {
  /** Optional external table instance to render. */
  table?: TableInstance<TData>
  /** Array of data items to display in the table. */
  data?: TData[]
  /** Column definitions for TanStack Table. */
  columns?: ColumnDef<TData, unknown>[]
  /** Whether column sorting is enabled. */
  enableSorting?: boolean
  /** Whether filtering is enabled. */
  enableFiltering?: boolean
  /** Whether pagination is enabled. */
  enablePagination?: boolean
  /** Whether to use compact pagination style. */
  compactPagination?: boolean
  /** Number of rows per page. */
  pageSize?: number
  /** Available page size options. */
  pageSizeOptions?: readonly number[]
  /** Current global filter value. */
  globalFilter?: string
  /** Handler called when global filter changes. */
  onGlobalFilterChange?: (value: string) => void
  /** Message to display when table has no data. */
  emptyMessage?: string
  /** Additional CSS class names. */
  className?: string
  /** Whether to use sticky table header. */
  stickyHeader?: boolean
  /** Maximum height of the table container. */
  maxHeight?: string
  /** Whether to enable Excel-like column resizing. */
  enableColumnResizing?: boolean
  /** Whether to enable Excel-like row resizing. */
  enableRowResizing?: boolean
}

/** Generic data table with sorting, filtering, and pagination support. */
const TableComponent = <TData,>({
  table: externalTable,
  data,
  columns,
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  compactPagination = false,
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  globalFilter = '',
  onGlobalFilterChange,
  emptyMessage = 'No data available.',
  className,
  stickyHeader = true,
  maxHeight = '500px',
  enableColumnResizing = false,
  enableRowResizing = false,
}: TableProps<TData>) => {
  const resolvedData = data ?? []
  const resolvedColumns = columns ?? []

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [internalGlobalFilter, setInternalGlobalFilter] = useState(globalFilter)
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({})
  const [resizingRow, setResizingRow] = useState<string | null>(null)

  useEffect(() => {
    setInternalGlobalFilter(globalFilter)
  }, [globalFilter])

  const internalTable = useReactTable<TData>({
    data: resolvedData,
    columns: resolvedColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter: internalGlobalFilter,
      columnSizing,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: (value) => {
      const nextValue = String(value ?? '')
      setInternalGlobalFilter(nextValue)
      onGlobalFilterChange?.(nextValue)
    },
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    globalFilterFn,
    enableGlobalFilter: enableFiltering,
    enableColumnResizing,
    columnResizeMode: 'onChange',
    initialState: {
      pagination: {
        pageSize,
      },
    },
    meta: {
      rowHeights,
    },
  })

  const table = externalTable ?? internalTable
  const rows = table.getRowModel().rows
  const paginationState = table.getState().pagination
  const columnCount =
    table.getAllLeafColumns().length || resolvedColumns.length || 1

  const handleRowResize = (rowId: string, startY: number) => {
    setResizingRow(rowId)
    const startHeight = rowHeights[rowId] ?? DEFAULT_ROW_HEIGHT

    const handleMouseMove = (event: MouseEvent) => {
      const deltaY = event.clientY - startY
      const newHeight = Math.max(MIN_ROW_HEIGHT, startHeight + deltaY)
      setRowHeights((prev) => ({ ...prev, [rowId]: newHeight }))
    }

    const handleMouseUp = () => {
      setResizingRow(null)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative rounded-2xl border border-border/60 bg-card/80 shadow-sm',
          'overflow-auto [scrollbar-gutter:stable]'
        )}
        style={stickyHeader ? { maxHeight } : undefined}
      >
        {stickyHeader && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 rounded-t-2xl bg-muted shadow-sm" />
        )}
        <table className="w-full border-collapse text-sm">
          <thead
            className={cn(
              'bg-muted shadow-sm',
              stickyHeader && 'sticky top-0 z-20'
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const alignRight =
                    header.column.id === 'amount' ||
                    header.column.id === 'actions'

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        'relative px-4 py-3 text-left text-[11px] font-semibold',
                        'uppercase tracking-[0.2em] text-muted-foreground',
                        'border-b border-border/70 bg-muted',
                        stickyHeader && 'sticky top-0 z-20',
                        canSort &&
                          'cursor-pointer select-none hover:bg-muted/30',
                        alignRight && 'text-right'
                      )}
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      style={{
                        width: header.column.getSize(),
                        minWidth: header.column.columnDef.minSize,
                        maxWidth: header.column.columnDef.maxSize,
                      }}
                    >
                      <div
                        className={cn(
                          'flex items-center gap-2',
                          alignRight && 'justify-end'
                        )}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {canSort && (
                          <span className="text-muted-foreground/70">
                            {sorted === 'asc' ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : sorted === 'desc' ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronsUpDown className="h-4 w-4" />
                            )}
                          </span>
                        )}
                      </div>
                      {enableColumnResizing && header.column.getCanResize() && (
                        <button
                          type="button"
                          aria-label={`Resize ${String(
                            header.column.columnDef.header
                          )} column`}
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={cn(
                            'absolute right-0 top-0 h-full w-1.5',
                            'cursor-col-resize select-none touch-none',
                            'border-0 bg-border/70 p-0',
                            'hover:bg-primary/60 hover:w-2',
                            'focus:bg-primary/70 focus:outline-none',
                            'focus:ring-2 focus:ring-primary/50 focus:w-2',
                            header.column.getIsResizing() &&
                              'bg-primary/60 w-2',
                            'transition-all duration-150'
                          )}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none opacity-60">
                            <div className="h-0.5 w-0.5 rounded-full bg-foreground/60" />
                            <div className="h-0.5 w-0.5 rounded-full bg-foreground/60" />
                            <div className="h-0.5 w-0.5 rounded-full bg-foreground/60" />
                          </div>
                        </button>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors relative"
                  style={{
                    height: rowHeights[row.id]
                      ? `${rowHeights[row.id]}px`
                      : undefined,
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-4 py-3 text-foreground',
                        cell.column.id === 'amount' ||
                          cell.column.id === 'actions'
                          ? 'text-right'
                          : 'text-left'
                      )}
                      style={{
                        width: cell.column.getSize(),
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize,
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                  {enableRowResizing && (
                    <td
                      className="absolute bottom-0 left-0 right-0 h-0 p-0"
                      style={{ zIndex: 10 }}
                    >
                      <button
                        type="button"
                        aria-label={`Resize row ${row.id}`}
                        onMouseDown={(event) =>
                          handleRowResize(row.id, event.clientY)
                        }
                        onTouchStart={(event) => {
                          if (event.touches[0]) {
                            handleRowResize(row.id, event.touches[0].clientY)
                          }
                        }}
                        className={cn(
                          'absolute bottom-0 left-0 right-0 h-1.5',
                          'cursor-row-resize select-none touch-none',
                          'border-0 bg-border/70 p-0',
                          'hover:bg-primary/60 hover:h-2',
                          'focus:bg-primary/70 focus:outline-none',
                          'focus:ring-2 focus:ring-primary/50 focus:h-2',
                          resizingRow === row.id && 'bg-primary/60 h-2',
                          'transition-all duration-150'
                        )}
                      >
                        <div className="absolute inset-0 flex items-center justify-center gap-0.5 pointer-events-none opacity-60">
                          <div className="h-0.5 w-0.5 rounded-full bg-foreground/60" />
                          <div className="h-0.5 w-0.5 rounded-full bg-foreground/60" />
                          <div className="h-0.5 w-0.5 rounded-full bg-foreground/60" />
                        </div>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {enablePagination && rows.length > 0 && (
        <>
          {compactPagination ? (
            <div className="flex items-center justify-center gap-2 px-2 py-2 border-t border-border/60">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="rounded p-1 text-muted-foreground hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Previous page"
                type="button"
              >
                <ChevronUp className="h-4 w-4 rotate-[-90deg]" />
              </button>
              <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                {(paginationState?.pageIndex ?? 0) + 1}/{table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="rounded p-1 text-muted-foreground hover:bg-muted/30 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Next page"
                type="button"
              >
                <ChevronUp className="h-4 w-4 rotate-90" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {table.getPageCount() === 1 ? (
                    `${table.getFilteredRowModel().rows.length} result${
                      table.getFilteredRowModel().rows.length === 1 ? '' : 's'
                    }`
                  ) : (
                    <>
                      Showing{' '}
                      {(paginationState?.pageIndex ?? 0) *
                        (paginationState?.pageSize ?? pageSize) +
                        1}{' '}
                      to{' '}
                      {Math.min(
                        ((paginationState?.pageIndex ?? 0) + 1) *
                          (paginationState?.pageSize ?? pageSize),
                        table.getFilteredRowModel().rows.length
                      )}{' '}
                      of {table.getFilteredRowModel().rows.length} results
                    </>
                  )}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Rows per page:
                  </span>
                  <select
                    value={String(paginationState?.pageSize ?? pageSize)}
                    onChange={(event) =>
                      table.setPageSize(Number(event.target.value))
                    }
                    className={cn(
                      'rounded border border-border/60 bg-background px-2 py-1',
                      'text-xs text-foreground focus:outline-none',
                      'focus:ring-2 focus:ring-primary/50'
                    )}
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {'<<'}
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {'<'}
                  </button>
                  <span className="px-2 text-xs text-muted-foreground">
                    Page {(paginationState?.pageIndex ?? 0) + 1} of{' '}
                    {table.getPageCount()}
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {'>'}
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                  >
                    {'>>'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/** Memoized table component for rendering TanStack tables. */
const Table = memo(TableComponent) as <TData>(
  props: TableProps<TData>
) => ReturnType<typeof TableComponent>

export interface TableSkeletonProps<TData> {
  /** Column definitions to determine table structure. */
  columns: ColumnDef<TData, unknown>[]
  /** Number of skeleton rows to display. */
  rowCount?: number
  /** Whether to show pagination skeleton. */
  showPagination?: boolean
  /** Whether pagination is compact style. */
  compactPagination?: boolean
  /** Custom class name. */
  className?: string
  /** Maximum height for scrollable area. */
  maxHeight?: string
}

/** Loading placeholder that mirrors the Table layout. */
const TableSkeleton = <TData,>({
  columns,
  rowCount = 5,
  showPagination = true,
  compactPagination = false,
  className,
  maxHeight = '500px',
}: TableSkeletonProps<TData>) => {
  const skeletonRows = Array.from({ length: rowCount })

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'relative rounded-2xl border border-border/60 bg-card/80 shadow-sm',
          'overflow-auto [scrollbar-gutter:stable]'
        )}
        style={{ maxHeight }}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 rounded-t-2xl bg-muted shadow-sm" />
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-20 bg-muted shadow-sm">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.id ?? index}
                  className={cn(
                    'px-4 py-3 text-left text-[11px] font-semibold uppercase',
                    'tracking-[0.2em] text-muted-foreground',
                    'border-b border-border/70 bg-muted',
                    'sticky top-0 z-20'
                  )}
                  style={{
                    width: column.size,
                    minWidth: column.minSize,
                    maxWidth: column.maxSize,
                  }}
                >
                  {typeof column.header === 'string' ? (
                    column.header
                  ) : (
                    <Skeleton className="h-4 w-20" />
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border/40">
            {skeletonRows.map((_, rowIndex) => (
              <tr key={rowIndex} className="animate-pulse">
                {columns.map((column, columnIndex) => (
                  <td
                    key={column.id ?? columnIndex}
                    className="px-4 py-3"
                    style={{
                      width: column.size,
                      minWidth: column.minSize,
                      maxWidth: column.maxSize,
                    }}
                  >
                    {column.id === 'actions' ? (
                      <div className="flex justify-center">
                        <MoreHorizontal className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    ) : (
                      <Skeleton
                        className={cn(
                          'h-4',
                          columnIndex === 0
                            ? 'w-32'
                            : columnIndex % 2 === 0
                              ? 'w-24'
                              : 'w-full max-w-[200px]'
                        )}
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPagination && (
        <>
          {compactPagination ? (
            <div className="flex items-center justify-center gap-2 px-2 py-2 border-t border-border/60">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-6 w-6 rounded" />
            </div>
          ) : (
            <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16 rounded" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-20 mx-2" />
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export { Table, TableSkeleton }
export default Table
