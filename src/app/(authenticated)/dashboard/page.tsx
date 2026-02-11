'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency, getCategoryIcon, getCategoryColor } from '@/lib/utils'
import { TellerLink } from '@/components/teller-link'
import { AddTransactionDialog } from '@/components/add-transaction-dialog'
import { BudgetProgressItem } from '@/components/budget-progress-item'
import { GoalProgressItem } from '@/components/goal-progress-item'
import { NetWorthSummaryCard } from '@/components/net-worth-summary-card'
import { RemindersCard } from '@/components/reminders-card'
import { SpendingChart } from '@/components/spending-chart'
import { CashFlowChart } from '@/components/cash-flow-chart'
import { FinancialOverviewCards } from '@/components/financial-overview-cards'
import { CreditUtilizationCard } from '@/components/credit-utilization-card'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { AddReminderModal } from '@/components/add-reminder-modal'
import { AIFinancialInsights } from '@/components/ai-financial-insights'
import DonationsCard from '@/components/donations-card'
import { FadeIn } from '@/components/motion/fade-in'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAccounts,
  useTransactions,
  useBudgets,
  useGoals,
  useCategories,
  useMonthlyStats,
  useTotalBalance,
  useCreditCardUtilization,
  useSeedCategories,
  useCreditCards,
  queryKeys,
} from '@/hooks/use-finance-data'
import {
  generateEnhancedInsights,
  analyzeSpendingPatterns,
} from '@/lib/enhanced-ai'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [insights, setInsights] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [reminders, setReminders] = useState([
    {
      id: '1',
      title: 'Review monthly budget',
      date: '2024-01-15',
      time: '10:00 AM',
      completed: false,
      type: 'budget' as const,
    },
    {
      id: '2',
      title: 'Pay credit card bill',
      date: '2024-01-20',
      time: '2:00 PM',
      completed: false,
      type: 'bill' as const,
    },
  ])
  const queryClient = useQueryClient()

  // Memoized callbacks
  const handleTellerSuccess = useCallback(() => {
    window.location.reload()
  }, [])

  // Fetch data using TanStack Query
  const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts()
  const { data: transactions = [], isLoading: isTransactionsLoading } =
    useTransactions()
  const { data: budgets = [], isLoading: isBudgetsLoading } = useBudgets()
  const { data: goals = [], isLoading: isGoalsLoading } = useGoals()
  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories()
  const { data: creditCards = [], isLoading: isCreditCardsLoading } =
    useCreditCards()
  const seedCategoriesMutation = useSeedCategories()
  const isLoading =
    isAccountsLoading ||
    isTransactionsLoading ||
    isBudgetsLoading ||
    isGoalsLoading ||
    isCategoriesLoading ||
    isCreditCardsLoading

  // Auto-seed categories if user has none
  if (
    session?.user?.id &&
    categories.length === 0 &&
    !isCategoriesLoading &&
    !seedCategoriesMutation.isPending
  ) {
    seedCategoriesMutation.mutate()
  }

  // Computed values
  const totalBalance = useTotalBalance()
  const { monthlyIncome, monthlyExpenses, netIncome } = useMonthlyStats()
  const { utilization: creditCardUtilization } = useCreditCardUtilization()

  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets })
      queryClient.invalidateQueries({ queryKey: queryKeys.goals })
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [queryClient])

  // Transform data for AI functions
  const categoryLookup = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  )

  const transformedTransactions = useMemo(
    () =>
      transactions.map((t) => {
        const categoryName =
          t.categoryRelation?.name ||
          categoryLookup.get(t.categoryId ?? '') ||
          t.category ||
          'Other'

        return {
          id: t.id,
          description: t.description,
          amount: t.amount,
          category: categoryName,
          date: t.date,
          type: t.type,
        }
      }),
    [categoryLookup, transactions]
  )

  const transformedBudgets = useMemo(
    () =>
      budgets.map((b) => ({
        id: b.id,
        name: b.name,
        amount: b.amount,
        category:
          typeof b.category === 'string' ? b.category : b.category?.name,
      })),
    [budgets]
  )

  const transformedGoals = useMemo(
    () =>
      goals.map((g) => ({
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate,
      })),
    [goals]
  )

  const normalizeDonationRecipient = useCallback((description: string) => {
    const trimmedDescription = description.trim()
    if (!trimmedDescription) return 'Unknown recipient'

    const upperDescription = trimmedDescription.toUpperCase()
    const splitTokens = [
      ' ID ',
      ' ID:',
      ' PPD ',
      ' WEB ',
      ' ACH ',
      ' POS ',
      ' TRANSFER ',
      ' PAYMENT ',
      ' DEBIT ',
      ' CREDIT ',
    ]
    let cutoffIndex = trimmedDescription.length

    splitTokens.forEach((token) => {
      const tokenIndex = upperDescription.indexOf(token)
      if (tokenIndex > 0 && tokenIndex < cutoffIndex) {
        cutoffIndex = tokenIndex
      }
    })

    const cleaned = trimmedDescription
      .slice(0, cutoffIndex)
      .replace(/\s{2,}/g, ' ')
      .trim()

    return cleaned || trimmedDescription
  }, [])

  const donationSummary = useMemo(() => {
    const donationCategoryNames = new Set([
      'charity',
      'donation',
      'donations',
      'giving',
      'tithe',
      'tithes',
      'offering',
      'offerings',
    ])
    const donationKeywords = [
      'donation',
      'charity',
      'church',
      'tithe',
      'offering',
      'giving',
      'igreja',
    ]
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const donationTransactions = transformedTransactions.filter(
      (transaction) => {
        if (transaction.type !== 'EXPENSE') return false
        const transactionDate = new Date(transaction.date)
        if (transactionDate < thirtyDaysAgo) return false
        const category = transaction.category?.toLowerCase() ?? ''
        const description = transaction.description.toLowerCase()

        return (
          donationCategoryNames.has(category) ||
          donationKeywords.some((keyword) => description.includes(keyword))
        )
      }
    )

    const recipientMap = new Map<
      string,
      {
        name: string
        total: number
        count: number
        lastDate: string
        lastTimestamp: number
      }
    >()

    donationTransactions.forEach((transaction) => {
      const recipientName = normalizeDonationRecipient(transaction.description)
      const existing = recipientMap.get(recipientName)
      const transactionDate = new Date(transaction.date)
      const formattedDate = transactionDate.toLocaleDateString('en-US')
      const timestamp = transactionDate.getTime()
      const updatedTotal = Math.abs(transaction.amount)

      if (!existing) {
        recipientMap.set(recipientName, {
          name: recipientName,
          total: updatedTotal,
          count: 1,
          lastDate: formattedDate,
          lastTimestamp: timestamp,
        })
        return
      }

      existing.total += updatedTotal
      existing.count += 1
      if (timestamp > existing.lastTimestamp) {
        existing.lastDate = formattedDate
        existing.lastTimestamp = timestamp
      }
      recipientMap.set(recipientName, existing)
    })

    const entries = Array.from(recipientMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
      .map(({ lastTimestamp, ...entry }) => entry)

    const total = donationTransactions.reduce(
      (sum, transaction) => sum + Math.abs(transaction.amount),
      0
    )

    return {
      entries,
      total,
      hasData: donationTransactions.length > 0,
    }
  }, [normalizeDonationRecipient, transformedTransactions])

  // Generate insights when data changes
  useEffect(() => {
    if (transactions.length > 0 && budgets.length > 0 && goals.length > 0) {
      setIsAnalyzing(true)
      generateEnhancedInsights(
        transformedTransactions,
        transformedBudgets,
        transformedGoals
      )
        .then(setInsights)
        .finally(() => setIsAnalyzing(false))
    }
  }, [
    transactions,
    budgets,
    goals,
    transformedTransactions,
    transformedBudgets,
    transformedGoals,
  ])

  // Get recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Prepare spending chart data
  const spendingData = analyzeSpendingPatterns(transformedTransactions).map(
    (pattern) => ({
      category: pattern.category,
      amount: pattern.totalSpent,
      percentage: pattern.percentageOfTotal,
      color: getCategoryColor(pattern.category),
    })
  )

  // Prepare cash flow data (last 6 months)
  const cashFlowData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date)
      return (
        tDate.getMonth() === date.getMonth() &&
        tDate.getFullYear() === date.getFullYear()
      )
    })

    const income = monthTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = monthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return {
      date: date.toLocaleDateString('en-US', { month: 'short' }),
      income,
      expenses,
      net: income - expenses,
    }
  }).reverse()

  // Calculate net worth (simplified - you can enhance this)
  const assets = totalBalance
  const liabilities = 0 // You can add credit card balances, loans, etc.
  const netWorth = assets - liabilities
  const cashReserve = accounts
    .filter(
      (account) =>
        account.type === 'CHECKING' || account.type === 'SAVINGS'
    )
    .reduce((total, account) => total + account.balance, 0)
  const investmentTotal = accounts
    .filter((account) => account.type === 'INVESTMENT')
    .reduce((total, account) => total + account.balance, 0)
  const netWorthSummaryItems = [
    { label: 'Monthly income', value: monthlyIncome },
    { label: 'Monthly expenses', value: monthlyExpenses },
    { label: 'Investments', value: investmentTotal },
    { label: 'Cash reserve', value: cashReserve },
  ]
  const hasNetWorthData = accounts.length > 0 || transactions.length > 0
  const dailyExpenses = Array.from({ length: 30 }, (_, index) => {
    const day = new Date()
    day.setDate(day.getDate() - (29 - index))
    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)

    return transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return (
          transaction.type === 'EXPENSE' &&
          transactionDate >= dayStart &&
          transactionDate <= dayEnd
        )
      })
      .reduce((total, transaction) => total + Math.abs(transaction.amount), 0)
  })
  const recentWindow = 7
  const recentExpenses = dailyExpenses.slice(-recentWindow)
  const recentAverage =
    recentExpenses.length > 0
      ? recentExpenses.reduce((sum, value) => sum + value, 0) /
        recentExpenses.length
      : 0
  const rangeSource = dailyExpenses.filter((value) => value > 0)
  const rangeValues = rangeSource.length >= 5 ? rangeSource : dailyExpenses
  const sortedRangeValues = [...rangeValues].sort((a, b) => a - b)
  const getRangePercentile = (percentile: number) => {
    if (sortedRangeValues.length === 0) {
      return 0
    }
    const index = Math.round((sortedRangeValues.length - 1) * percentile)
    return sortedRangeValues[Math.min(sortedRangeValues.length - 1, index)]
  }
  const hasForecast = sortedRangeValues.some((value) => value > 0)
  const forecastAverage =
    hasForecast && recentAverage > 0 ? recentAverage : undefined
  const forecastProjected =
    forecastAverage !== undefined ? forecastAverage * 30 : undefined
  const rawRangeLow = getRangePercentile(0.25)
  const rawRangeTypical = getRangePercentile(0.5)
  const rawRangeHigh = getRangePercentile(0.85)
  const normalizedLow = Math.min(rawRangeLow, rawRangeTypical, rawRangeHigh)
  const normalizedHigh = Math.max(rawRangeLow, rawRangeTypical, rawRangeHigh)
  const normalizedTypical = Math.min(
    Math.max(rawRangeTypical, normalizedLow),
    normalizedHigh
  )
  const forecastRange = hasForecast
    ? {
        low: normalizedLow,
        typical: normalizedTypical,
        high: normalizedHigh,
      }
    : undefined

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        <div className="space-y-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-80" />
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`dashboard-summary-${index}`}
              className="border-border/60 bg-card/80 shadow-sm"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`dashboard-primary-${index}`}
              className="border-border/60 bg-card/80 shadow-sm"
            >
              <CardHeader className="border-b border-border/60">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {Array.from({ length: 3 }).map((_, rowIndex) => (
                  <Skeleton
                    key={`dashboard-primary-row-${index}-${rowIndex}`}
                    className="h-12 w-full"
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card
              key={`dashboard-secondary-${index}`}
              className="border-border/60 bg-card/80 shadow-sm"
            >
              <CardHeader className="border-b border-border/60">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-3 w-36" />
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {Array.from({ length: 4 }).map((_, rowIndex) => (
                  <Skeleton
                    key={`dashboard-secondary-row-${index}-${rowIndex}`}
                    className="h-10 w-full"
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card
              key={`dashboard-tertiary-${index}`}
              className="border-border/60 bg-card/80 shadow-sm"
            >
              <CardHeader className="border-b border-border/60">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {Array.from({ length: 3 }).map((_, rowIndex) => (
                  <Skeleton
                    key={`dashboard-tertiary-row-${index}-${rowIndex}`}
                    className="h-11 w-full"
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-border/60 bg-card/80 shadow-sm">
            <CardHeader className="border-b border-border/60">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-32" />
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <Skeleton
                  key={`dashboard-transactions-${rowIndex}`}
                  className="h-14 w-full"
                />
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6 auto-rows-fr">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={`dashboard-side-${index}`}
                className="border-border/60 bg-card/80 shadow-sm"
              >
                <CardHeader className="border-b border-border/60">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {Array.from({ length: 2 }).map((_, rowIndex) => (
                    <Skeleton
                      key={`dashboard-side-row-${index}-${rowIndex}`}
                      className="h-10 w-full"
                    />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <FadeIn>
        <div
          className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Dashboard
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
              Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Here's your financial overview for this month
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AddTransactionDialog />
            <TellerLink onSuccess={handleTellerSuccess} />
          </div>
        </div>
      </FadeIn>

      {/* Financial Overview Cards */}
      <FadeIn delay={0.1}>
        <FinancialOverviewCards
          totalBalance={totalBalance}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          netIncome={netIncome}
          creditCardUtilization={creditCardUtilization}
        />
      </FadeIn>

      {/* Main Content Grid */}
      <FadeIn delay={0.15}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Net Worth Card */}
          <NetWorthSummaryCard
            netWorth={netWorth}
            summaryItems={netWorthSummaryItems}
            forecastRange={forecastRange}
            forecastAverage={forecastAverage}
            forecastProjected={forecastProjected}
            hasData={hasNetWorthData}
            className="h-full"
          />

          {/* Spending Chart */}
          <SpendingChart
            data={spendingData}
            totalSpending={monthlyExpenses}
            previousMonthTotal={monthlyExpenses * 0.95} // Mock data
            className="h-full"
          />

          {/* Reminders */}
          <div className="h-full">
            <RemindersCard
              reminders={reminders}
              action={
                <AddReminderModal
                  onReminderAdded={(reminder) => {
                    const reminderDate = new Date(reminder.date)
                    setReminders((prev) => [
                      {
                        id: reminder.id,
                        title: reminder.title,
                        date: reminderDate.toLocaleDateString('en-US'),
                        time: reminderDate.toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        }),
                        completed: false,
                        type: 'custom',
                      },
                      ...prev,
                    ])
                  }}
                  buttonLabel="Add"
                  buttonVariant="ghost"
                  className={
                    'h-8 px-3 text-xs font-medium text-blue-700 ' +
                    'hover:bg-blue-50/50 dark:text-blue-300 ' +
                    'dark:hover:bg-blue-500/10'
                  }
                />
              }
              onToggleReminder={(id) => {
                setReminders((prev) =>
                  prev.filter((reminder) => reminder.id !== id)
                )
              }}
              className="h-full"
            />
          </div>
        </div>
      </FadeIn>

      {/* Second Row */}
      <FadeIn delay={0.2}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Cash Flow Chart */}
          <div className="lg:col-span-2 h-full">
            <CashFlowChart data={cashFlowData} className="h-full" />
          </div>

          {/* AI Insights */}
          <div className="lg:col-span-1 h-full">
            <AIFinancialInsights
              transactions={transformedTransactions}
              budgets={transformedBudgets}
              goals={transformedGoals}
              className="h-full"
            />
          </div>
        </div>
      </FadeIn>

      {/* Third Row - Credit Utilization */}
      <FadeIn delay={0.25}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Credit Utilization */}
          <CreditUtilizationCard creditCards={creditCards} className="h-full" />

          {/* Analytics Dashboard */}
          <AnalyticsDashboard
            transactions={transformedTransactions}
            budgets={transformedBudgets}
            goals={transformedGoals}
            className="h-full"
          />
        </div>
      </FadeIn>

      {/* Fourth Row */}
      <FadeIn delay={0.3}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Recent Transactions */}
          <Card className="border-border/60 bg-card/80 shadow-sm lg:col-span-2 h-full">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your latest financial activity
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => {
                  const categoryName =
                    transaction.category ??
                    transaction.categoryRelation?.name ??
                    'Other'
                  return (
                    <div
                      key={transaction.id}
                      className={
                        'flex items-center justify-between rounded-lg border border-border/60 ' +
                        'bg-muted/30 p-4 transition-colors hover:bg-muted/40'
                      }
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={
                            'flex h-12 w-12 items-center justify-center rounded-xl ' +
                            'text-white shadow-md'
                          }
                          style={{
                            backgroundColor: getCategoryColor(categoryName),
                          }}
                        >
                          <span className="text-xl">
                            {getCategoryIcon(categoryName)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {transaction.description}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {categoryName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${
                            transaction.type === 'INCOME'
                              ? 'text-emerald-600 dark:text-emerald-300'
                              : 'text-rose-600 dark:text-rose-300'
                          }`}
                        >
                          {transaction.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div
                  className={
                    'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
                    'px-4 py-8 text-center'
                  }
                >
                  <p className="text-sm font-medium text-foreground">
                    No transactions yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 mb-5">
                    Start tracking your finances by adding your first
                    transaction.
                  </p>
                  <AddTransactionDialog />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budgets and Goals */}
          <div className="grid gap-6 auto-rows-fr">
            {/* Budget Progress */}
            <Card className="border-border/60 bg-card/80 shadow-sm h-full">
            <CardHeader className="border-b border-border/60">
                <CardTitle>Budget Progress</CardTitle>
                <CardDescription>This month's spending</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {budgets.length > 0 ? (
                  <div className="space-y-3">
                    {budgets.slice(0, 3).map((budget) => (
                      <BudgetProgressItem key={budget.id} budget={budget} />
                    ))}
                  </div>
                ) : (
                  <div
                    className={
                      'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
                      'px-4 py-6 text-center'
                    }
                  >
                    <p className="text-sm font-medium text-foreground">
                      No budgets yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Create a budget to track monthly spending.
                    </p>
                    <Button size="sm" variant="outline">
                      Create budget
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Goals Progress */}
            <Card className="border-border/60 bg-card/80 shadow-sm h-full">
              <CardHeader className="border-b border-border/60">
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Track your progress</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {goals.length > 0 ? (
                  <div className="space-y-3">
                    {goals.slice(0, 3).map((goal) => (
                      <GoalProgressItem key={goal.id} goal={goal} />
                    ))}
                  </div>
                ) : (
                  <div
                    className={
                      'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
                      'px-4 py-6 text-center'
                    }
                  >
                    <p className="text-sm font-medium text-foreground">
                      No goals yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Add a goal to keep progress visible.
                    </p>
                    <Button size="sm" variant="outline">
                      Set a goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <DonationsCard
              entries={donationSummary.entries}
              total={donationSummary.total}
              hasData={donationSummary.hasData}
              className="h-full"
            />
          </div>
        </div>
      </FadeIn>
    </div>
  )
}
