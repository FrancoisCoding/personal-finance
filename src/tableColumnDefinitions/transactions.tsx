import { Button } from '@/components/ui/button'
import { getRowValue, highlightText } from '@/lib/table'
import type { ColumnDef } from '@tanstack/react-table'

export type TransactionTableRow = {
  id: string
  description: string
  dateLabel: string
  categoryName: string
  categoryColor: string
  categoryIcon: string
  accountName: string
  amount: number
  amountLabel: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  isUncategorized: boolean
}

type TransactionColumnOptions = {
  onCategorize: (id: string) => void
  isCategorizing: (id: string) => boolean
  isLoading: boolean
}

export const createTransactionColumns = ({
  onCategorize,
  isCategorizing,
  isLoading,
}: TransactionColumnOptions): ColumnDef<TransactionTableRow>[] => [
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row, table }) => {
      const { globalFilter } = table.getState()
      const description = getRowValue<TransactionTableRow, 'description'>(
        row,
        'description'
      )
      const dateLabel = row.original.dateLabel

      return (
        <div className='space-y-1'>
          <p className='text-sm font-semibold text-foreground'>
            {highlightText(description, globalFilter)}
          </p>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span>{highlightText(dateLabel, globalFilter)}</span>
            <span className='h-1 w-1 rounded-full bg-muted-foreground/50' />
            <span>{row.original.accountName}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'categoryName',
    header: 'Category',
    cell: ({ row, table }) => {
      const { globalFilter } = table.getState()
      const categoryName = getRowValue<TransactionTableRow, 'categoryName'>(
        row,
        'categoryName'
      )

      return (
        <span
          className={
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 ' +
            'text-xs font-medium'
          }
          style={{
            color: row.original.categoryColor,
            backgroundColor: `${row.original.categoryColor}1A`,
            borderColor: `${row.original.categoryColor}33`,
          }}
        >
          <span className='text-base'>{row.original.categoryIcon}</span>
          {highlightText(categoryName, globalFilter)}
        </span>
      )
    },
  },
  {
    accessorKey: 'accountName',
    header: 'Account',
    cell: ({ row, table }) => {
      const { globalFilter } = table.getState()
      const accountName = getRowValue<TransactionTableRow, 'accountName'>(
        row,
        'accountName'
      )

      return (
        <span className='text-xs text-muted-foreground'>
          {highlightText(accountName, globalFilter)}
        </span>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row, table }) => {
      const { globalFilter } = table.getState()
      const amountLabel = row.original.amountLabel

      return (
        <div
          className={`text-right text-sm font-semibold ${
            row.original.type === 'INCOME'
              ? 'text-emerald-600 dark:text-emerald-300'
              : 'text-rose-600 dark:text-rose-300'
          }`}
        >
          {row.original.type === 'INCOME' ? '+' : '-'}
          {highlightText(amountLabel, globalFilter)}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Action',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      if (!row.original.isUncategorized) {
        return <div className='text-right text-xs text-muted-foreground'>-</div>
      }

      const busy = isLoading || isCategorizing(row.original.id)

      return (
        <div className='flex justify-end'>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onCategorize(row.original.id)}
            disabled={busy}
          >
            {busy ? (
              <span className='inline-flex items-center gap-2'>
                <span className='h-3 w-3 animate-spin rounded-full border-b border-current' />
                Categorizing
              </span>
            ) : (
              'Categorize'
            )}
          </Button>
        </div>
      )
    },
  },
]

export default createTransactionColumns
