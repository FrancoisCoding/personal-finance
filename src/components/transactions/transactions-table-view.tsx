import { flexRender, Table as TableType } from '@tanstack/react-table'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type TransactionsTableViewProps<T> = {
  className?: string
  table: TableType<T>
}

const TransactionsTableView = <T,>({
  className,
  table,
}: TransactionsTableViewProps<T>) => {
  return (
    <div
      className={cn(
        'max-h-[60vh] overflow-auto rounded-lg border border-border/60 bg-background/70',
        className
      )}
    >
      <Table>
        <TableHeader className='sticky top-0 z-10 bg-background/95 backdrop-blur'>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sortDirection = header.column.getIsSorted()
                const alignRight =
                  header.column.id === 'amount' ||
                  header.column.id === 'actions'

                return (
                  <TableHead
                    key={header.id}
                    className={cn(
                      'text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground',
                      alignRight && 'text-right'
                    )}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type='button'
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          'inline-flex items-center gap-2',
                          alignRight && 'w-full justify-end'
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {sortDirection === 'asc' ? (
                          <ChevronUp className='h-3 w-3' />
                        ) : sortDirection === 'desc' ? (
                          <ChevronDown className='h-3 w-3' />
                        ) : null}
                      </button>
                    ) : (
                      <span
                        className={cn(
                          alignRight && 'inline-flex w-full justify-end'
                        )}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </span>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={cn(
                    cell.column.id === 'amount' || cell.column.id === 'actions'
                      ? 'py-4 text-right'
                      : 'py-4'
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default TransactionsTableView
