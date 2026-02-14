'use client'

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  useTransactions,
  useCategories,
  useCreateTransaction,
  useAccounts,
  useUpdateTransaction,
} from '@/hooks/use-finance-data'
import { AddTransactionModal } from '@/components/transactions/add-transaction-modal'
import { Table, TableSkeleton } from '@/components/table'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SearchBar } from '@/components/ui/search-bar'
import useTransactionsTable from '@/hooks/use-transactions-table'
import { useToast } from '@/hooks/use-toast'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { DollarSign, Plus, TrendingDown, TrendingUp } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  formatCurrency,
  formatDate,
  getCategoryColor,
  getCategoryIcon,
} from '@/lib/utils'
import { createTransactionColumns } from '@/tableColumnDefinitions/transactions'

export default function TransactionsPage() {
  const { status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { isDemoMode } = useDemoMode()
  const { data: transactions = [], isLoading } = useTransactions()
  const { data: categories = [] } = useCategories()
  const { data: accounts = [] } = useAccounts()
  const createTransactionMutation = useCreateTransaction()
  const updateTransactionMutation = useUpdateTransaction()

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false)
  const [categorizingTransactions, setCategorizingTransactions] = useState<
    Set<string>
  >(new Set())

  useEffect(() => {
    if (status === 'unauthenticated' && !isDemoMode) {
      router.push('/auth/login')
    }
  }, [status, router, isDemoMode])

  // Filter transactions based on category and type
  const filteredTransactions = useMemo(
    () =>
      transactions.filter((transaction) => {
        const matchesCategory =
          selectedCategory === 'all' ||
          transaction.categoryId === selectedCategory
        const matchesType =
          selectedType === 'all' || transaction.type === selectedType
        return matchesCategory && matchesType
      }),
    [transactions, selectedCategory, selectedType]
  )

  const tableData = useMemo(() => {
    const categoryMap = new Map(categories.map((cat) => [cat.id, cat]))
    const accountMap = new Map(accounts.map((account) => [account.id, account]))

    return filteredTransactions.map((transaction) => {
      const categoryName =
        categoryMap.get(transaction.categoryId ?? '')?.name ??
        transaction.category ??
        'Other'
      const categoryColor = getCategoryColor(categoryName)
      const categoryIcon = getCategoryIcon(categoryName)
      const accountName =
        transaction.account?.name ??
        accountMap.get(transaction.accountId)?.name ??
        'Unknown Account'

      return {
        id: transaction.id,
        description: transaction.description,
        dateLabel: formatDate(transaction.date),
        categoryName,
        categoryColor,
        categoryIcon,
        accountName,
        amount: transaction.amount,
        amountLabel: formatCurrency(transaction.amount),
        type: transaction.type,
        isUncategorized: !transaction.categoryId,
      }
    })
  }, [accounts, categories, filteredTransactions])

  // Handle AI categorization
  const handleAutoCategorize = useCallback(
    async (transactionId: string) => {
      const transaction = transactions.find((t) => t.id === transactionId)
      if (!transaction) return

      // Add to categorizing set
      setCategorizingTransactions((prev) => new Set(prev).add(transactionId))

      try {
        toast({
          title: 'Categorizing transaction...',
          description: 'AI is analyzing your transaction...',
        })

        const response = await fetch('/api/ai/categorize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: transaction.description || '',
            amount: Math.abs(transaction.amount || 0),
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to categorize transaction')
        }

        const result = await response.json()

        // Update the transaction with the AI categorization
        const matchedCategory = categories.find(
          (category) =>
            category.name.toLowerCase() === result.category?.toLowerCase()
        )

        updateTransactionMutation.mutate(
          {
            id: transactionId,
            updates: {
              category: result.category,
              categoryId: matchedCategory?.id,
            },
          },
          {
            onSuccess: () => {
              toast({
                title: 'Transaction categorized',
                description: `Successfully categorized as: ${result.category}`,
              })
            },
            onError: () => {
              toast({
                title: 'Update failed',
                description: 'Categorized but failed to update transaction',
                variant: 'destructive',
              })
            },
          }
        )
      } catch (error) {
        console.error('AI categorization failed:', error)
        toast({
          title: 'Categorization failed',
          description: 'Failed to categorize transaction. Please try again.',
          variant: 'destructive',
        })
      } finally {
        // Remove from categorizing set
        setCategorizingTransactions((prev) => {
          const newSet = new Set(prev)
          newSet.delete(transactionId)
          return newSet
        })
      }
    },
    [categories, toast, transactions, updateTransactionMutation]
  )

  const columns = useMemo(
    () =>
      createTransactionColumns({
        onCategorize: handleAutoCategorize,
        isCategorizing: (id: string) => categorizingTransactions.has(id),
        isLoading,
      }),
    [categorizingTransactions, handleAutoCategorize, isLoading]
  )

  const { table, globalFilter, setGlobalFilter } = useTransactionsTable({
    data: tableData,
    columns,
  })

  const filteredRows = table.getFilteredRowModel().rows
  const filteredCount = filteredRows.length
  const totalIncome = filteredRows.reduce((sum, row) => {
    if (row.original.type === 'INCOME') {
      return sum + row.original.amount
    }
    return sum
  }, 0)
  const totalExpenses = filteredRows.reduce((sum, row) => {
    if (row.original.type === 'EXPENSE') {
      return sum + row.original.amount
    }
    return sum
  }, 0)
  const netAmount = totalIncome - totalExpenses

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(event.target.value)
    table.setPageIndex(0)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    table.setPageIndex(0)
  }

  const handleTypeChange = (value: string) => {
    setSelectedType(value)
    table.setPageIndex(0)
  }

  // Handle transaction creation
  const handleCreateTransaction = (transactionData: {
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    accountId: string
    categoryId?: string
    date: Date
    notes?: string
  }) => {
    createTransactionMutation.mutate(
      {
        ...transactionData,
        isRecurring: false,
        tags: [],
      },
      {
        onSuccess: () => {
          setShowAddTransactionModal(false)
        },
      }
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div
            className={
              'inline-flex items-center gap-2 rounded-full border border-border/60 ' +
              'bg-muted/30 px-3 py-1 text-xs text-muted-foreground'
            }
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Transaction activity
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Transactions
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Track and manage your transaction history with smart categorization.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setShowAddTransactionModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total income
                </p>
                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div
                className={
                  'flex h-10 w-10 items-center justify-center rounded-full ' +
                  'bg-emerald-500/10 text-emerald-500'
                }
              >
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Filtered transactions
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total expenses
                </p>
                <p className="text-2xl font-semibold text-rose-600 dark:text-rose-300">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div
                className={
                  'flex h-10 w-10 items-center justify-center rounded-full ' +
                  'bg-rose-500/10 text-rose-500'
                }
              >
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Outflows this view
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Net amount
                </p>
                <p
                  className={`text-2xl font-semibold ${
                    netAmount >= 0
                      ? 'text-emerald-600 dark:text-emerald-300'
                      : 'text-rose-600 dark:text-rose-300'
                  }`}
                >
                  {formatCurrency(netAmount)}
                </p>
              </div>
              <div
                className={
                  'flex h-10 w-10 items-center justify-center rounded-full ' +
                  'bg-slate-500/10 text-slate-500'
                }
              >
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Income minus expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card
        className="border-border/60 bg-card/80 shadow-sm"
        data-demo-step="demo-transactions"
      >
        <CardHeader className="border-b border-border/60">
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {isLoading
              ? 'Loading transactions...'
              : `${filteredCount} transactions match your filters`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div
            className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"
            data-demo-step="demo-transaction-filters"
          >
            <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
              <SearchBar
                containerClassName="max-w-[24rem]"
                inputClassName="h-9"
                placeholder="Search transactions"
                value={String(globalFilter ?? '')}
                onChange={handleSearchChange}
                disabled={isLoading}
              />
              <Select
                value={selectedCategory}
                onValueChange={handleCategoryChange}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedType}
                onValueChange={handleTypeChange}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9 w-full sm:w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isLoading}>
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                  {table
                    .getAllLeafColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(Boolean(value))
                        }
                      >
                        {typeof column.columnDef.header === 'string'
                          ? column.columnDef.header
                          : column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" disabled={isLoading}>
                Export
              </Button>
            </div>
          </div>

          {isLoading ? (
            <TableSkeleton columns={columns} rowCount={6} maxHeight="60vh" />
          ) : filteredCount === 0 ? (
            <div
              className={
                'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
                'px-4 py-8 text-center'
              }
            >
              <p className="text-sm font-medium text-foreground">
                No transactions found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <Table
              table={table}
              columns={columns}
              maxHeight="60vh"
              pageSizeOptions={[10, 20, 50, 100]}
            />
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        open={showAddTransactionModal}
        onOpenChange={setShowAddTransactionModal}
        onSubmit={handleCreateTransaction}
        isLoading={createTransactionMutation.isPending}
        accounts={accounts}
        categories={categories}
      />
    </div>
  )
}
