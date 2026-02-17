'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BudgetProgressItem } from '@/components/budget-progress-item'
import { CreateBudgetModal } from '@/components/budgets/create-budget-modal'
import {
  useBudgets,
  useCategories,
  useCreateBudget,
  useTransactions,
} from '@/hooks/use-finance-data'
import { formatCurrency } from '@/lib/utils'

type TForecastStatus = 'healthy' | 'warning' | 'over'

export default function BudgetsPage() {
  const [isCreateBudgetModalOpen, setIsCreateBudgetModalOpen] = useState(false)
  const { data: budgets = [] } = useBudgets()
  const { data: categories = [] } = useCategories()
  const { data: transactions = [] } = useTransactions()
  const createBudgetMutation = useCreateBudget()

  const categoryLookup = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  )

  const transactionDateEntries = useMemo(
    () =>
      transactions
        .map((transaction) => {
          const transactionDate = new Date(transaction.date)
          if (Number.isNaN(transactionDate.getTime())) return null
          return { transaction, transactionDate }
        })
        .filter(
          (
            entry
          ): entry is {
            transaction: (typeof transactions)[number]
            transactionDate: Date
          } => entry !== null
        ),
    [transactions]
  )

  const budgetForecastItems = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const millisecondsPerDay = 24 * 60 * 60 * 1000

    const getBudgetWindow = (budget: (typeof budgets)[number]) => {
      const period = budget.period ?? 'MONTHLY'

      if (period === 'WEEKLY') {
        const start = new Date(startOfToday)
        start.setDate(start.getDate() - start.getDay())
        const end = new Date(start)
        end.setDate(end.getDate() + 6)
        end.setHours(23, 59, 59, 999)
        return { windowStart: start, windowEnd: end }
      }

      if (period === 'YEARLY') {
        const start = new Date(startOfToday.getFullYear(), 0, 1)
        const end = new Date(
          startOfToday.getFullYear(),
          11,
          31,
          23,
          59,
          59,
          999
        )
        return { windowStart: start, windowEnd: end }
      }

      if (period === 'DAILY') {
        const end = new Date(startOfToday)
        end.setHours(23, 59, 59, 999)
        return { windowStart: startOfToday, windowEnd: end }
      }

      const start = new Date(
        startOfToday.getFullYear(),
        startOfToday.getMonth(),
        1
      )
      const end = new Date(
        startOfToday.getFullYear(),
        startOfToday.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      )
      return { windowStart: start, windowEnd: end }
    }

    const getStatusRank = (status: TForecastStatus) => {
      if (status === 'over') return 3
      if (status === 'warning') return 2
      return 1
    }

    return budgets
      .map((budget) => {
        const categoryName =
          typeof budget.category === 'string'
            ? budget.category
            : budget.category?.name
        const { windowStart, windowEnd } = getBudgetWindow(budget)
        const effectiveEndTime = Math.min(
          startOfToday.getTime(),
          windowEnd.getTime()
        )
        const daysElapsed = Math.max(
          1,
          Math.floor(
            (effectiveEndTime - windowStart.getTime()) / millisecondsPerDay
          ) + 1
        )
        const daysInWindow = Math.max(
          1,
          Math.floor(
            (windowEnd.getTime() - windowStart.getTime()) / millisecondsPerDay
          ) + 1
        )

        const matchesBudgetCategory = (
          transaction: (typeof transactions)[number]
        ) => {
          if (budget.categoryId) {
            return transaction.categoryId === budget.categoryId
          }

          if (categoryName) {
            const transactionCategoryName =
              transaction.categoryRelation?.name ||
              categoryLookup.get(transaction.categoryId ?? '') ||
              transaction.category
            return transactionCategoryName === categoryName
          }

          return true
        }

        const spentToDate = transactionDateEntries
          .filter(
            ({ transaction, transactionDate }) =>
              transaction.type === 'EXPENSE' &&
              transactionDate >= windowStart &&
              transactionDate.getTime() <= effectiveEndTime &&
              matchesBudgetCategory(transaction)
          )
          .reduce(
            (sum, { transaction }) => sum + Math.abs(transaction.amount),
            0
          )

        const projectedSpend = (spentToDate / daysElapsed) * daysInWindow
        const remainingAmount = budget.amount - spentToDate
        const averageDailySpend = spentToDate / daysElapsed
        const projectedUtilization =
          budget.amount > 0 ? (projectedSpend / budget.amount) * 100 : 0
        const currentUtilization =
          budget.amount > 0 ? (spentToDate / budget.amount) * 100 : 0

        let status: TForecastStatus = 'healthy'
        if (projectedUtilization >= 100 || currentUtilization >= 100) {
          status = 'over'
        } else if (projectedUtilization >= 85 || currentUtilization >= 80) {
          status = 'warning'
        }

        const daysUntilOverBudget =
          averageDailySpend > 0 && remainingAmount > 0
            ? Math.ceil(remainingAmount / averageDailySpend)
            : remainingAmount <= 0
              ? 0
              : null

        const daysRemainingInWindow = Math.max(
          0,
          Math.floor(
            (windowEnd.getTime() - startOfToday.getTime()) / millisecondsPerDay
          )
        )
        const likelyOverrunDate =
          daysUntilOverBudget !== null &&
          daysUntilOverBudget > 0 &&
          daysUntilOverBudget <= daysRemainingInWindow
            ? new Date(
                startOfToday.getTime() +
                  Math.max(0, daysUntilOverBudget - 1) * millisecondsPerDay
              )
            : null

        return {
          id: budget.id,
          name: budget.name,
          amount: budget.amount,
          spentToDate,
          projectedSpend,
          remainingAmount,
          projectedUtilization,
          currentUtilization,
          status,
          daysUntilOverBudget,
          likelyOverrunDate,
        }
      })
      .sort(
        (a, b) =>
          getStatusRank(b.status) - getStatusRank(a.status) ||
          b.projectedUtilization - a.projectedUtilization
      )
  }, [budgets, categoryLookup, transactionDateEntries])

  const budgetSummary = useMemo(() => {
    const totalBudgeted = budgets.reduce(
      (sum, budget) => sum + budget.amount,
      0
    )
    const totalSpentToDate = budgetForecastItems.reduce(
      (sum, item) => sum + item.spentToDate,
      0
    )
    const overCount = budgetForecastItems.filter(
      (item) => item.status === 'over'
    ).length
    const warningCount = budgetForecastItems.filter(
      (item) => item.status === 'warning'
    ).length

    return {
      totalBudgeted,
      totalSpentToDate,
      overCount,
      warningCount,
      projectedOverrun: budgetForecastItems.reduce(
        (sum, item) => sum + Math.max(0, item.projectedSpend - item.amount),
        0
      ),
    }
  }, [budgetForecastItems, budgets])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Budget planning
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Budgets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Forecast month-end utilization, catch overruns early, and keep each
            category on track.
          </p>
        </div>
        <Button onClick={() => setIsCreateBudgetModalOpen(true)}>
          Create budget
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Active budgets
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {budgets.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Total budgeted
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(budgetSummary.totalBudgeted)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Spent to date
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {formatCurrency(budgetSummary.totalSpentToDate)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              At risk
            </p>
            <p className="mt-1 text-2xl font-semibold text-rose-600 dark:text-rose-300">
              {budgetSummary.overCount + budgetSummary.warningCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border/70 bg-card/90 shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Forecast</CardTitle>
            <CardDescription>
              Projected month-end utilization and overrun risk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {budgetForecastItems.length > 0 ? (
              budgetForecastItems.map((forecast) => (
                <div
                  key={forecast.id}
                  className="rounded-xl border border-border/60 bg-muted/10 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {forecast.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(forecast.spentToDate)} spent ·{' '}
                        {formatCurrency(forecast.amount)} budget
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        forecast.status === 'over'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
                          : forecast.status === 'warning'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                            : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {forecast.status === 'over'
                        ? 'Over risk'
                        : forecast.status === 'warning'
                          ? 'Watch'
                          : 'On track'}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Progress
                      value={Math.min(100, forecast.projectedUtilization)}
                      className="h-2"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Projected: {formatCurrency(forecast.projectedSpend)} (
                      {forecast.projectedUtilization.toFixed(0)}%)
                    </p>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {forecast.daysUntilOverBudget === 0
                      ? `Already over by ${formatCurrency(
                          Math.abs(forecast.remainingAmount)
                        )}.`
                      : forecast.likelyOverrunDate
                        ? `Likely over around ${forecast.likelyOverrunDate.toLocaleDateString(
                            'en-US'
                          )}.`
                        : `Remaining runway: ${formatCurrency(
                            Math.max(0, forecast.remainingAmount)
                          )}.`}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No active budgets yet
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Create your first budget to unlock forecasting.
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => setIsCreateBudgetModalOpen(true)}
                >
                  Create budget
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Budget Progress</CardTitle>
            <CardDescription>Current utilization by budget.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {budgets.length > 0 ? (
              <div className="space-y-3">
                {budgets.map((budget) => (
                  <BudgetProgressItem key={budget.id} budget={budget} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No budgets yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateBudgetModal
        open={isCreateBudgetModalOpen}
        onOpenChange={setIsCreateBudgetModalOpen}
        onSubmit={async (budgetData) => {
          await createBudgetMutation.mutateAsync(budgetData)
          setIsCreateBudgetModalOpen(false)
        }}
        isLoading={createBudgetMutation.isPending}
        categories={categories}
      />
    </div>
  )
}
