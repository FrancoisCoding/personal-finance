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
type TBudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

const periodLabels: Record<TBudgetPeriod, string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
}

export default function BudgetsPage() {
  const [isCreateBudgetModalOpen, setIsCreateBudgetModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | TForecastStatus>(
    'all'
  )
  const [periodFilter, setPeriodFilter] = useState<'all' | TBudgetPeriod>('all')
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
          period: budget.period ?? 'MONTHLY',
          categoryName,
          amount: budget.amount,
          spentToDate,
          projectedSpend,
          remainingAmount,
          projectedUtilization,
          currentUtilization,
          status,
          daysUntilOverBudget,
          daysRemainingInWindow,
          recommendedDailyCap:
            remainingAmount > 0 && daysRemainingInWindow > 0
              ? remainingAmount / (daysRemainingInWindow + 1)
              : 0,
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

  const statusCounts = useMemo(
    () => ({
      healthy: budgetForecastItems.filter((item) => item.status === 'healthy')
        .length,
      warning: budgetForecastItems.filter((item) => item.status === 'warning')
        .length,
      over: budgetForecastItems.filter((item) => item.status === 'over').length,
    }),
    [budgetForecastItems]
  )

  const filteredBudgetForecastItems = useMemo(
    () =>
      budgetForecastItems.filter((item) => {
        const matchesStatus =
          statusFilter === 'all' ? true : item.status === statusFilter
        const matchesPeriod =
          periodFilter === 'all' ? true : item.period === periodFilter
        return matchesStatus && matchesPeriod
      }),
    [budgetForecastItems, periodFilter, statusFilter]
  )

  const periodMix = useMemo(() => {
    const totals: Record<TBudgetPeriod, { count: number; amount: number }> = {
      DAILY: { count: 0, amount: 0 },
      WEEKLY: { count: 0, amount: 0 },
      MONTHLY: { count: 0, amount: 0 },
      YEARLY: { count: 0, amount: 0 },
    }

    budgets.forEach((budget) => {
      const period = budget.period ?? 'MONTHLY'
      totals[period].count += 1
      totals[period].amount += budget.amount
    })

    const maxAmount = Math.max(
      1,
      ...Object.values(totals).map((periodItem) => periodItem.amount)
    )

    return (Object.keys(totals) as TBudgetPeriod[]).map((period) => ({
      period,
      label: periodLabels[period],
      count: totals[period].count,
      amount: totals[period].amount,
      utilization: (totals[period].amount / maxAmount) * 100,
    }))
  }, [budgets])

  const coverageMetrics = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthlyExpenses = transactionDateEntries.filter(
      ({ transaction, transactionDate }) =>
        transaction.type === 'EXPENSE' && transactionDate >= monthStart
    )

    const totalMonthlyExpenses = monthlyExpenses.reduce(
      (sum, { transaction }) => sum + Math.abs(transaction.amount),
      0
    )

    const uncategorizedMonthlyExpenses = monthlyExpenses
      .filter(
        ({ transaction }) =>
          !transaction.categoryId &&
          !transaction.categoryRelation?.name &&
          (!transaction.category || transaction.category === 'Other')
      )
      .reduce((sum, { transaction }) => sum + Math.abs(transaction.amount), 0)

    const budgetCategoryNames = new Set(
      budgets
        .map((budget) => {
          if (budget.category?.name) return budget.category.name
          if (budget.categoryId) return categoryLookup.get(budget.categoryId)
          return null
        })
        .filter((name): name is string => Boolean(name))
    )

    const coveredMonthlyExpenses = monthlyExpenses
      .filter(({ transaction }) => {
        const transactionCategoryName =
          transaction.categoryRelation?.name ||
          categoryLookup.get(transaction.categoryId ?? '') ||
          transaction.category
        return (
          typeof transactionCategoryName === 'string' &&
          budgetCategoryNames.has(transactionCategoryName)
        )
      })
      .reduce((sum, { transaction }) => sum + Math.abs(transaction.amount), 0)

    const categoryScopedBudgetCount = budgets.filter(
      (budget) => budget.categoryId || budget.category?.name
    ).length

    return {
      totalMonthlyExpenses,
      uncategorizedMonthlyExpenses,
      coveredMonthlyExpenses,
      coveragePercent:
        totalMonthlyExpenses > 0
          ? (coveredMonthlyExpenses / totalMonthlyExpenses) * 100
          : 0,
      categoryScopedBudgetCount,
      unscopedBudgetCount: Math.max(
        0,
        budgets.length - categoryScopedBudgetCount
      ),
    }
  }, [budgets, categoryLookup, transactionDateEntries])

  const overrunTimeline = useMemo(
    () =>
      filteredBudgetForecastItems
        .filter((item) => item.status === 'over' || item.likelyOverrunDate)
        .map((item) => ({
          id: item.id,
          name: item.name,
          status: item.status,
          date: item.likelyOverrunDate,
          overrunAmount: Math.max(0, item.projectedSpend - item.amount),
        }))
        .sort((a, b) => {
          if (!a.date && !b.date) return b.overrunAmount - a.overrunAmount
          if (!a.date) return 1
          if (!b.date) return -1
          return a.date.getTime() - b.date.getTime()
        })
        .slice(0, 5),
    [filteredBudgetForecastItems]
  )

  const uncoveredSpendOpportunities = useMemo(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const budgetCategoryNames = new Set(
      budgets
        .map((budget) => {
          if (budget.category?.name) return budget.category.name
          if (budget.categoryId) return categoryLookup.get(budget.categoryId)
          return null
        })
        .filter((name): name is string => Boolean(name))
    )

    const totalsByCategory = new Map<string, number>()

    transactionDateEntries.forEach(({ transaction, transactionDate }) => {
      if (transaction.type !== 'EXPENSE' || transactionDate < monthStart) {
        return
      }

      const categoryName =
        transaction.categoryRelation?.name ||
        categoryLookup.get(transaction.categoryId ?? '') ||
        transaction.category ||
        'Uncategorized'

      totalsByCategory.set(
        categoryName,
        (totalsByCategory.get(categoryName) ?? 0) + Math.abs(transaction.amount)
      )
    })

    const totalUncovered = Array.from(totalsByCategory.entries())
      .filter(([categoryName]) => !budgetCategoryNames.has(categoryName))
      .reduce((sum, [, amount]) => sum + amount, 0)

    return Array.from(totalsByCategory.entries())
      .filter(([categoryName]) => !budgetCategoryNames.has(categoryName))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([categoryName, amount]) => ({
        categoryName,
        amount,
        share: totalUncovered > 0 ? (amount / totalUncovered) * 100 : 0,
      }))
  }, [budgets, categoryLookup, transactionDateEntries])

  const actionableInsights = useMemo(() => {
    const insights: Array<{
      id: string
      tone: 'critical' | 'warning' | 'positive' | 'info'
      title: string
      detail: string
    }> = []

    const topRiskBudget = budgetForecastItems.find(
      (item) => item.status === 'over'
    )
    if (topRiskBudget) {
      insights.push({
        id: 'top-risk-budget',
        tone: 'critical',
        title: `${topRiskBudget.name} is projected over budget`,
        detail: `Projected overrun ${formatCurrency(
          Math.max(0, topRiskBudget.projectedSpend - topRiskBudget.amount)
        )}.`,
      })
    }

    const topWarningBudget = budgetForecastItems.find(
      (item) => item.status === 'warning'
    )
    if (topWarningBudget) {
      insights.push({
        id: 'top-warning-budget',
        tone: 'warning',
        title: `${topWarningBudget.name} is nearing its limit`,
        detail: `Recommended daily cap: ${formatCurrency(
          topWarningBudget.recommendedDailyCap
        )}.`,
      })
    }

    if (coverageMetrics.uncategorizedMonthlyExpenses > 0) {
      insights.push({
        id: 'uncategorized-expenses',
        tone: 'warning',
        title: 'Uncategorized expenses are reducing forecast accuracy',
        detail: `${formatCurrency(
          coverageMetrics.uncategorizedMonthlyExpenses
        )} is uncategorized this month.`,
      })
    }

    if (coverageMetrics.unscopedBudgetCount > 0) {
      insights.push({
        id: 'unscoped-budgets',
        tone: 'info',
        title: 'Some budgets are not category-scoped',
        detail: `${coverageMetrics.unscopedBudgetCount} budget(s) apply broadly and can overlap reporting.`,
      })
    }

    if (
      !topRiskBudget &&
      !topWarningBudget &&
      budgetForecastItems.length > 0 &&
      budgetSummary.projectedOverrun <= 0
    ) {
      insights.push({
        id: 'healthy-outlook',
        tone: 'positive',
        title: 'Budgets are currently on track',
        detail: 'No projected overruns across active budget windows.',
      })
    }

    if (budgetForecastItems.length === 0) {
      insights.push({
        id: 'no-budgets',
        tone: 'info',
        title: 'Create your first budget to unlock forecasting',
        detail: 'Add category-scoped budgets for the clearest insights.',
      })
    }

    return insights.slice(0, 4)
  }, [budgetForecastItems, budgetSummary.projectedOverrun, coverageMetrics])

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
            <p className="mt-1 text-xs text-muted-foreground">
              Projected overrun {formatCurrency(budgetSummary.projectedOverrun)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border/70 bg-card/90 shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Budget Command Center</CardTitle>
                <CardDescription>
                  Filter the workspace and prioritize highest-risk budgets.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('all')
                  setPeriodFilter('all')
                }}
              >
                Reset filters
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-2">
              {(['all', 'over', 'warning', 'healthy'] as const).map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={statusFilter === value ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(value)}
                >
                  {value === 'all'
                    ? 'All status'
                    : value === 'over'
                      ? `Over (${statusCounts.over})`
                      : value === 'warning'
                        ? `Warning (${statusCounts.warning})`
                        : `Healthy (${statusCounts.healthy})`}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).map(
                (value) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={periodFilter === value ? 'default' : 'outline'}
                    onClick={() => setPeriodFilter(value)}
                  >
                    {value === 'all' ? 'All periods' : periodLabels[value]}
                  </Button>
                )
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Healthy
                </p>
                <p className="mt-1 text-xl font-semibold text-emerald-600 dark:text-emerald-300">
                  {statusCounts.healthy}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Warning
                </p>
                <p className="mt-1 text-xl font-semibold text-amber-700 dark:text-amber-300">
                  {statusCounts.warning}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Over risk
                </p>
                <p className="mt-1 text-xl font-semibold text-rose-600 dark:text-rose-300">
                  {statusCounts.over}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Coverage Opportunities</CardTitle>
            <CardDescription>
              High-spend categories without a matching budget this month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {uncoveredSpendOpportunities.length > 0 ? (
              uncoveredSpendOpportunities.map((item) => (
                <div
                  key={item.categoryName}
                  className="rounded-xl border border-border/60 bg-muted/10 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.categoryName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.share.toFixed(0)}%
                    </p>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No uncovered category spend detected this month.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border/70 bg-card/90 shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Risk Timeline</CardTitle>
            <CardDescription>
              Expected overrun sequence based on current spending pace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {overrunTimeline.length > 0 ? (
              overrunTimeline.map((item) => (
                <div
                  key={`timeline-${item.id}`}
                  className="rounded-xl border border-border/60 bg-muted/10 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        item.status === 'over'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {item.status === 'over'
                        ? 'Already over'
                        : 'Projected risk'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.date
                      ? `Estimated overrun date: ${item.date.toLocaleDateString('en-US')}`
                      : 'Overrun already reached in this window.'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Projected overrun: {formatCurrency(item.overrunAmount)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No near-term overruns detected with current filters.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Quick Notes</CardTitle>
            <CardDescription>
              Fast interpretation of the current budget posture.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 text-xs text-muted-foreground">
            <p>
              Active filter result:{' '}
              <span className="font-semibold text-foreground">
                {filteredBudgetForecastItems.length}
              </span>{' '}
              budgets.
            </p>
            <p>
              Current filter status:{' '}
              <span className="font-semibold text-foreground">
                {statusFilter}
              </span>
              .
            </p>
            <p>
              Current filter period:{' '}
              <span className="font-semibold text-foreground">
                {periodFilter === 'all' ? 'all' : periodLabels[periodFilter]}
              </span>
              .
            </p>
            <p>
              Use filters to isolate risk clusters, then adjust budget amounts
              or category scope.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border/70 bg-card/90 shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Actionable Insights</CardTitle>
            <CardDescription>
              Highest-impact adjustments based on current budget behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {actionableInsights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-xl border border-border/60 bg-muted/10 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {insight.title}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      insight.tone === 'critical'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
                        : insight.tone === 'warning'
                          ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                          : insight.tone === 'positive'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : 'bg-sky-500/10 text-sky-700 dark:text-sky-300'
                    }`}
                  >
                    {insight.tone}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {insight.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Period Mix</CardTitle>
            <CardDescription>
              Allocation across budget cadences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {periodMix.map((periodItem) => (
              <div key={periodItem.period} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <p className="font-medium text-foreground">
                    {periodItem.label}
                  </p>
                  <p className="text-muted-foreground">
                    {periodItem.count} budgets ·{' '}
                    {formatCurrency(periodItem.amount)}
                  </p>
                </div>
                <Progress value={periodItem.utilization} className="h-1.5" />
              </div>
            ))}
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
            {filteredBudgetForecastItems.length > 0 ? (
              filteredBudgetForecastItems.map((forecast) => (
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
                  No budgets match the current filters
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Adjust status or period filters to view more forecasts.
                </p>
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => {
                    setStatusFilter('all')
                    setPeriodFilter('all')
                  }}
                >
                  Reset filters
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="border-border/70 bg-card/90 shadow-sm xl:col-span-2">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Runway Guidance</CardTitle>
            <CardDescription>
              Daily caps to prevent overruns before the budget window closes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            {filteredBudgetForecastItems.length > 0 ? (
              filteredBudgetForecastItems.slice(0, 6).map((forecast) => (
                <div
                  key={`runway-${forecast.id}`}
                  className="rounded-xl border border-border/60 bg-muted/10 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {forecast.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {periodLabels[forecast.period]}
                    </p>
                  </div>
                  <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                    <p>
                      Remaining:{' '}
                      {formatCurrency(Math.max(0, forecast.remainingAmount))}
                    </p>
                    <p>Days left: {forecast.daysRemainingInWindow}</p>
                    <p>
                      Daily cap:{' '}
                      {formatCurrency(
                        Math.max(0, forecast.recommendedDailyCap)
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No runway guidance available for current filters.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 shadow-sm">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle>Coverage Quality</CardTitle>
            <CardDescription>
              How much this month&apos;s spend is represented by active budgets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <p className="font-medium text-foreground">Coverage</p>
                <p className="text-muted-foreground">
                  {coverageMetrics.coveragePercent.toFixed(0)}%
                </p>
              </div>
              <Progress
                value={coverageMetrics.coveragePercent}
                className="mt-2 h-2"
              />
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>
                Covered expenses:{' '}
                <span className="font-semibold text-foreground">
                  {formatCurrency(coverageMetrics.coveredMonthlyExpenses)}
                </span>
              </p>
              <p>
                Uncategorized expenses:{' '}
                <span className="font-semibold text-foreground">
                  {formatCurrency(coverageMetrics.uncategorizedMonthlyExpenses)}
                </span>
              </p>
              <p>
                Category-scoped budgets:{' '}
                <span className="font-semibold text-foreground">
                  {coverageMetrics.categoryScopedBudgetCount}
                </span>
              </p>
              <p>
                Unscoped budgets:{' '}
                <span className="font-semibold text-foreground">
                  {coverageMetrics.unscopedBudgetCount}
                </span>
              </p>
            </div>
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
