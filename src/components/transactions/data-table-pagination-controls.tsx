import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type DataTablePaginationControlsProps<T> = {
  className?: string
  table: Table<T>
  pageSizeOptions?: number[]
}

const DataTablePaginationControls = <T,>({
  className,
  table,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTablePaginationControlsProps<T>) => {
  const totalRows = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const start = totalRows === 0 ? 0 : pageIndex * pageSize + 1
  const end = Math.min((pageIndex + 1) * pageSize, totalRows)
  const pageDisplay = totalRows ? `${start}-${end} of ${totalRows}` : '0 results'

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-border/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className='flex items-center gap-2 text-xs text-muted-foreground'>
        <span>Rows per page</span>
        <Select
          value={String(pageSize)}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className='h-8 w-[90px] text-xs'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className='flex flex-wrap items-center gap-3'>
        <div className='text-xs text-muted-foreground'>{pageDisplay}</div>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

export default DataTablePaginationControls
