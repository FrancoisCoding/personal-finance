'use client'

import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useAtom } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency, getCategoryColor } from '@/lib/utils'
import { getCategoryIconComponent } from '@/lib/category-icons'
import { TellerLink } from '@/components/teller-link'
import { AddTransactionDialog } from '@/components/add-transaction-dialog'
import { CreateBudgetModal } from '@/components/budgets/create-budget-modal'
import { BudgetProgressItem } from '@/components/budget-progress-item'
import { CreateGoalModal } from '@/components/goals/create-goal-modal'
import { GoalProgressItem } from '@/components/goal-progress-item'
import { NetWorthSummaryCard } from '@/components/net-worth-summary-card'
import { RemindersCard } from '@/components/reminders-card'
import { FinancialOverviewCards } from '@/components/financial-overview-cards'
import { CreditUtilizationCard } from '@/components/credit-utilization-card'
import { AddReminderModal } from '@/components/add-reminder-modal'
import DonationsCard from '@/components/donations-card'
import { FadeIn } from '@/components/motion/fade-in'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
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
  useSubscriptions,
  useReminders,
  useCreateBudget,
  useCreateGoal,
  useCreateReminder,
  useUpdateReminder,
  useClearCompletedReminders,
  queryKeys,
} from '@/hooks/use-finance-data'
import { analyzeSpendingPatterns } from '@/lib/enhanced-ai'
import { calculateBudgetForecastItems } from '@/lib/budget-forecast'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { demoWalkthroughOpenAtom } from '@/store/ui-atoms'

const SpendingChart = dynamic(
  () => import('@/components/spending-chart').then((mod) => mod.SpendingChart),
  {
    ssr: false,
    loading: () => (
      <Card className="border-border/60 bg-card/80 shadow-sm h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-52 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={`spending-chart-skeleton-${index}`}
                className="h-10 w-full"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    ),
  }
)

const CashFlowChart = dynamic(
  () => import('@/components/cash-flow-chart').then((mod) => mod.CashFlowChart),
  {
    ssr: false,
    loading: () => (
      <Card className="border-border/60 bg-card/80 shadow-sm h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    ),
  }
)

const AIFinancialInsights = dynamic(
  () =>
    import('@/components/ai-financial-insights').then(
      (mod) => mod.AIFinancialInsights
    ),
  {
    ssr: false,
    loading: () => (
      <Card className="border-border/60 bg-card/80 shadow-sm h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={`ai-insights-skeleton-${index}`}
              className="h-16 w-full"
            />
          ))}
        </CardContent>
      </Card>
    ),
  }
)

const AnalyticsDashboard = dynamic(
  () =>
    import('@/components/analytics-dashboard').then(
      (mod) => mod.AnalyticsDashboard
    ),
  {
    ssr: false,
    loading: () => (
      <Card className="border-border/60 bg-card/80 shadow-sm h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton
                key={`analytics-metric-skeleton-${index}`}
                className="h-20 w-full"
              />
            ))}
          </div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-36 w-full" />
        </CardContent>
      </Card>
    ),
  }
)

export default function DashboardPage() {
  const { data: session } = useSession()
  const { isDemoMode } = useDemoMode()
  const queryClient = useQueryClient()
  const [, setIsWalkthroughOpen] = useAtom(demoWalkthroughOpenAtom)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [demoProgress, setDemoProgress] = useState(0)
  const [isCreateBudgetModalOpen, setIsCreateBudgetModalOpen] = useState(false)
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false)
  const demoProgressIntervalRef = useRef<number | null>(null)
  const highContrastActionButtonClass =
    'min-h-11 border border-primary/85 bg-primary text-slate-950 font-semibold ' +
    'shadow-[0_0_0_1px_hsl(var(--primary)/0.55),0_12px_30px_hsl(var(--primary)/0.33)] ' +
    'hover:bg-primary/90 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-primary ' +
    'focus-visible:ring-offset-2 focus-visible:ring-offset-background'

  // Memoized callbacks
  const handleTellerSuccess = useCallback(() => {
    window.location.reload()
  }, [])

  useEffect(() => {
    return () => {
      if (demoProgressIntervalRef.current !== null) {
        window.clearInterval(demoProgressIntervalRef.current)
        demoProgressIntervalRef.current = null
      }
    }
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
  const { data: subscriptions = [], isLoading: isSubscriptionsLoading } =
    useSubscriptions()
  const { data: reminders = [], isLoading: isRemindersLoading } = useReminders()
  const seedCategoriesMutation = useSeedCategories()
  const createBudgetMutation = useCreateBudget()
  const createGoalMutation = useCreateGoal()
  const createReminderMutation = useCreateReminder()
  const updateReminderMutation = useUpdateReminder()
  const clearCompletedRemindersMutation = useClearCompletedReminders()
  const isLoading =
    isAccountsLoading ||
    isTransactionsLoading ||
    isBudgetsLoading ||
    isGoalsLoading ||
    isCategoriesLoading ||
    isCreditCardsLoading ||
    isRemindersLoading

  useEffect(() => {
    if (!isDemoMode) return

    let shouldShow = false
    try {
      shouldShow = localStorage.getItem('finance-demo-loading') === '1'
    } catch (error) {
      void error
    }

    if (!shouldShow) return

    setIsDemoLoading(true)
    setDemoProgress(18)
    if (demoProgressIntervalRef.current !== null) {
      window.clearInterval(demoProgressIntervalRef.current)
    }
    demoProgressIntervalRef.current = window.setInterval(() => {
      setDemoProgress((current) => {
        if (current >= 90) return current
        const next =
          current < 45 ? current + 7 : current < 75 ? current + 4 : current + 2
        return Math.min(90, next)
      })
    }, 240)
  }, [isDemoMode])

  useEffect(() => {
    if (isDemoMode) return
    if (demoProgressIntervalRef.current !== null) {
      window.clearInterval(demoProgressIntervalRef.current)
      demoProgressIntervalRef.current = null
    }
    setIsDemoLoading(false)
    setDemoProgress(0)
    try {
      localStorage.removeItem('finance-demo-loading')
    } catch (error) {
      void error
    }
  }, [isDemoMode])

  useEffect(() => {
    if (!isDemoLoading) return
    if (isLoading) return

    setDemoProgress(100)
    if (demoProgressIntervalRef.current !== null) {
      window.clearInterval(demoProgressIntervalRef.current)
      demoProgressIntervalRef.current = null
    }
    try {
      localStorage.removeItem('finance-demo-loading')
    } catch (error) {
      void error
    }

    const timeout = window.setTimeout(() => {
      setIsDemoLoading(false)
    }, 500)

    return () => window.clearTimeout(timeout)
  }, [isDemoLoading, isLoading])

  const demoLoadingModal = (
    <Dialog open={isDemoLoading}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Loading demo experience</DialogTitle>
          <DialogDescription>
            Pulling sample accounts, transactions, and insights.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Syncing data</span>
            <span>{demoProgress}%</span>
          </div>
          <Progress value={demoProgress} className="h-2" />
        </div>
      </DialogContent>
    </Dialog>
  )

  useEffect(() => {
    if (
      session?.user?.id &&
      categories.length === 0 &&
      !isCategoriesLoading &&
      !seedCategoriesMutation.isPending
    ) {
      seedCategoriesMutation.mutate()
    }
  }, [
    categories.length,
    isCategoriesLoading,
    seedCategoriesMutation,
    session?.user?.id,
  ])

  // Computed values
  const totalBalance = useTotalBalance()
  const { monthlyIncome, monthlyExpenses, netIncome } = useMonthlyStats()
  const { utilization: creditCardUtilization } = useCreditCardUtilization()

  useEffect(() => {
    if (isDemoMode) {
      return
    }

    const interval = setInterval(
      () => {
        if (document.visibilityState !== 'visible') {
          return
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
        queryClient.invalidateQueries({ queryKey: queryKeys.budgets })
        queryClient.invalidateQueries({ queryKey: queryKeys.goals })
        queryClient.invalidateQueries({ queryKey: ['credit-cards'] })
      },
      5 * 60 * 1000
    )

    return () => clearInterval(interval)
  }, [isDemoMode, queryClient])

  // Transform data for AI functions
  const categoryLookup = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  )

  const transactionDateEntries = useMemo(
    () =>
      transactions.map((transaction) => {
        const transactionDate = new Date(transaction.date)
        return {
          transaction,
          transactionDate,
          dayKey: transactionDate.toISOString().slice(0, 10),
          monthKey: `${transactionDate.getFullYear()}-${String(
            transactionDate.getMonth() + 1
          ).padStart(2, '0')}`,
        }
      }),
    [transactions]
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

  const getMedian = useCallback((values: number[]) => {
    const sorted = [...values].sort((a, b) => a - b)
    if (sorted.length === 0) return 0
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }, [])

  const liquidCashBalance = useMemo(() => {
    const liquidAccounts = accounts.filter(
      (account) => account.type === 'CHECKING' || account.type === 'SAVINGS'
    )
    if (liquidAccounts.length === 0) {
      return totalBalance
    }
    return liquidAccounts.reduce((sum, account) => sum + account.balance, 0)
  }, [accounts, totalBalance])

  const budgetForecastItems = useMemo(
    () =>
      calculateBudgetForecastItems({
        budgets,
        transactions,
        categoryLookup,
        limit: 4,
      }),
    [budgets, categoryLookup, transactions]
  )

  const budgetForecastSummary = useMemo(() => {
    const warningCount = budgetForecastItems.filter(
      (item) => item.status === 'warning'
    ).length
    const overCount = budgetForecastItems.filter(
      (item) => item.status === 'over'
    ).length
    const projectedOverrunTotal = budgetForecastItems.reduce(
      (sum, item) => sum + Math.max(0, item.projectedSpend - item.amount),
      0
    )

    return {
      warningCount,
      overCount,
      projectedOverrunTotal,
      previewItems: budgetForecastItems.slice(0, 2),
    }
  }, [budgetForecastItems])

  const cashFlowPlanningSnapshot = useMemo(() => {
    type TCashEvent = {
      id: string
      title: string
      date: Date
      amount: number
      kind: 'income' | 'expense'
      source: 'subscription' | 'pattern'
    }

    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const horizonDays = 30
    const day14 = new Date(startOfToday)
    day14.setDate(day14.getDate() + 14)
    const horizonEnd = new Date(startOfToday)
    horizonEnd.setDate(horizonEnd.getDate() + horizonDays)
    const millisecondsPerDay = 24 * 60 * 60 * 1000

    const events: TCashEvent[] = []
    const addBillingCycle = (
      date: Date,
      billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'WEEKLY' | 'CUSTOM'
    ) => {
      const next = new Date(date)
      if (billingCycle === 'WEEKLY') {
        next.setDate(next.getDate() + 7)
        return next
      }
      if (billingCycle === 'QUARTERLY') {
        next.setMonth(next.getMonth() + 3)
        return next
      }
      if (billingCycle === 'YEARLY') {
        next.setFullYear(next.getFullYear() + 1)
        return next
      }
      if (billingCycle === 'MONTHLY') {
        next.setMonth(next.getMonth() + 1)
        return next
      }
      return next
    }

    subscriptions.forEach((subscription) => {
      if (!subscription.isActive) {
        return
      }

      const billingCycle = subscription.billingCycle
      let nextDate = new Date(subscription.nextBillingDate)
      nextDate.setHours(0, 0, 0, 0)
      let guard = 0

      while (nextDate <= horizonEnd && guard < 18) {
        if (nextDate >= startOfToday) {
          events.push({
            id: `subscription-${subscription.id}-${nextDate.toISOString().slice(0, 10)}`,
            title: subscription.name,
            date: new Date(nextDate),
            amount: Math.abs(subscription.amount),
            kind: 'expense',
            source: 'subscription',
          })
        }

        if (billingCycle === 'CUSTOM') {
          break
        }

        nextDate = addBillingCycle(nextDate, billingCycle)
        guard += 1
      }
    })

    const historyStart = new Date(startOfToday)
    historyStart.setDate(historyStart.getDate() - 120)
    const groupedPatterns = new Map<
      string,
      {
        type: 'INCOME' | 'EXPENSE'
        description: string
        dates: Date[]
        amounts: number[]
        isRecurring: boolean
      }
    >()

    transactionDateEntries.forEach(({ transaction, transactionDate }) => {
      if (transactionDate < historyStart || transaction.type === 'TRANSFER') {
        return
      }
      const normalizedDescription = transaction.description
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
      const patternKey = `${transaction.type}|${normalizedDescription}`
      const existing = groupedPatterns.get(patternKey)
      if (!existing) {
        groupedPatterns.set(patternKey, {
          type: transaction.type,
          description: transaction.description.trim(),
          dates: [transactionDate],
          amounts: [Math.abs(transaction.amount)],
          isRecurring: transaction.isRecurring,
        })
        return
      }

      existing.dates.push(transactionDate)
      existing.amounts.push(Math.abs(transaction.amount))
      existing.isRecurring = existing.isRecurring || transaction.isRecurring
      groupedPatterns.set(patternKey, existing)
    })

    groupedPatterns.forEach((pattern, patternKey) => {
      if (pattern.dates.length < 2) {
        return
      }

      const sortedDates = [...pattern.dates].sort(
        (a, b) => a.getTime() - b.getTime()
      )
      const intervals = sortedDates
        .slice(1)
        .map((date, index) =>
          Math.round(
            (date.getTime() - sortedDates[index].getTime()) / millisecondsPerDay
          )
        )
        .filter((value) => value > 0)

      if (intervals.length === 0) {
        return
      }

      const medianInterval = getMedian(intervals)
      if (medianInterval < 10 || medianInterval > 45) {
        return
      }

      if (
        !pattern.isRecurring &&
        pattern.type === 'EXPENSE' &&
        pattern.dates.length < 3
      ) {
        return
      }

      const averageAmount =
        pattern.amounts.reduce((sum, amount) => sum + amount, 0) /
        pattern.amounts.length
      const minAmount = Math.min(...pattern.amounts)
      const maxAmount = Math.max(...pattern.amounts)
      if (
        averageAmount <= 0 ||
        (maxAmount - minAmount) / averageAmount > 0.45
      ) {
        return
      }

      let nextDate = new Date(sortedDates[sortedDates.length - 1])
      let guard = 0
      while (nextDate <= horizonEnd && guard < 6) {
        nextDate = new Date(
          nextDate.getTime() + Math.round(medianInterval) * millisecondsPerDay
        )
        if (nextDate > horizonEnd) {
          break
        }
        if (nextDate < startOfToday) {
          guard += 1
          continue
        }

        const title =
          pattern.description.length > 36
            ? `${pattern.description.slice(0, 36).trimEnd()}...`
            : pattern.description
        events.push({
          id: `pattern-${patternKey}-${nextDate.toISOString().slice(0, 10)}-${guard}`,
          title,
          date: new Date(nextDate),
          amount: averageAmount,
          kind: pattern.type === 'INCOME' ? 'income' : 'expense',
          source: 'pattern',
        })
        guard += 1
      }
    })

    const sortedEvents = events.sort(
      (a, b) =>
        a.date.getTime() - b.date.getTime() || a.title.localeCompare(b.title)
    )
    const eventsIn14 = sortedEvents.filter((event) => event.date <= day14)
    const income14 = eventsIn14
      .filter((event) => event.kind === 'income')
      .reduce((sum, event) => sum + event.amount, 0)
    const expenses14 = eventsIn14
      .filter((event) => event.kind === 'expense')
      .reduce((sum, event) => sum + event.amount, 0)
    const income30 = sortedEvents
      .filter((event) => event.kind === 'income')
      .reduce((sum, event) => sum + event.amount, 0)
    const expenses30 = sortedEvents
      .filter((event) => event.kind === 'expense')
      .reduce((sum, event) => sum + event.amount, 0)

    const dailyBuckets = new Map<string, { income: number; expenses: number }>()
    Array.from({ length: horizonDays }, (_, dayOffset) => {
      const day = new Date(startOfToday)
      day.setDate(day.getDate() + dayOffset)
      dailyBuckets.set(day.toISOString().slice(0, 10), {
        income: 0,
        expenses: 0,
      })
    })

    sortedEvents.forEach((event) => {
      const dayKey = event.date.toISOString().slice(0, 10)
      const bucket = dailyBuckets.get(dayKey)
      if (!bucket) {
        return
      }
      if (event.kind === 'income') {
        bucket.income += event.amount
      } else {
        bucket.expenses += event.amount
      }
      dailyBuckets.set(dayKey, bucket)
    })

    const lowCashThreshold = Math.max(250, liquidCashBalance * 0.15)
    let projectedBalance = liquidCashBalance
    const timeline = Array.from({ length: horizonDays }, (_, dayOffset) => {
      const day = new Date(startOfToday)
      day.setDate(day.getDate() + dayOffset)
      const dayKey = day.toISOString().slice(0, 10)
      const bucket = dailyBuckets.get(dayKey) ?? { income: 0, expenses: 0 }
      const delta = bucket.income - bucket.expenses
      projectedBalance += delta
      return {
        day,
        dayKey,
        delta,
        endingBalance: projectedBalance,
        isLowCashDay: projectedBalance < lowCashThreshold,
      }
    })

    return {
      income14,
      expenses14,
      net14: income14 - expenses14,
      income30,
      expenses30,
      net30: income30 - expenses30,
      lowCashDays: timeline.filter((day) => day.isLowCashDay).length,
      timeline,
      upcomingEvents: sortedEvents.slice(0, 8),
      lowCashThreshold,
    }
  }, [getMedian, liquidCashBalance, subscriptions, transactionDateEntries])

  const inferDonationCause = useCallback(
    (category: string | undefined, description: string) => {
      const normalizedCategory = category?.toLowerCase() ?? ''
      const normalizedDescription = description.toLowerCase()

      const causeMatchers = [
        {
          name: 'Church',
          keywords: [
            'church',
            'chapel',
            'parish',
            'ministry',
            'tithe',
            'offering',
            'igrej',
          ],
        },
        {
          name: 'Charity',
          keywords: [
            'charity',
            'foundation',
            'nonprofit',
            'ngo',
            'donation',
            'relief',
          ],
        },
        {
          name: 'Community',
          keywords: ['community', 'food bank', 'shelter', 'outreach'],
        },
        {
          name: 'Education',
          keywords: ['school', 'education', 'scholar', 'university', 'college'],
        },
        {
          name: 'Health',
          keywords: ['hospital', 'medical', 'clinic', 'health'],
        },
      ]

      for (const matcher of causeMatchers) {
        if (
          matcher.keywords.some(
            (keyword) =>
              normalizedDescription.includes(keyword) ||
              normalizedCategory.includes(keyword)
          )
        ) {
          return matcher.name
        }
      }

      if (
        normalizedCategory.includes('donation') ||
        normalizedCategory.includes('charity')
      ) {
        return 'Charity'
      }

      return 'Other'
    },
    []
  )

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
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const ninetyDaysAgo = new Date(now)
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const donationTransactions = transformedTransactions.filter(
      (transaction) => {
        if (transaction.type !== 'EXPENSE') return false
        const category = transaction.category?.toLowerCase() ?? ''
        const description = transaction.description.toLowerCase()

        return (
          donationCategoryNames.has(category) ||
          donationKeywords.some((keyword) => description.includes(keyword))
        )
      }
    )

    const recentDonations = donationTransactions.filter(
      (transaction) => new Date(transaction.date) >= thirtyDaysAgo
    )
    const recurringWindow = donationTransactions.filter(
      (transaction) => new Date(transaction.date) >= ninetyDaysAgo
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

    recentDonations.forEach((transaction) => {
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

    const causeTotals = new Map<string, number>()
    recentDonations.forEach((transaction) => {
      const cause = inferDonationCause(
        transaction.category,
        transaction.description
      )
      const currentTotal = causeTotals.get(cause) ?? 0
      causeTotals.set(cause, currentTotal + Math.abs(transaction.amount))
    })

    const entries = Array.from(recipientMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
      .map((entry) => ({
        name: entry.name,
        total: entry.total,
        count: entry.count,
        lastDate: entry.lastDate,
      }))

    const total = recentDonations.reduce(
      (sum, transaction) => sum + Math.abs(transaction.amount),
      0
    )

    const causes = Array.from(causeTotals.entries())
      .map(([name, value]) => ({
        name,
        total: value,
        percent: total > 0 ? (value / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)

    const cadenceFromMedian = (medianDays: number) => {
      if (medianDays <= 9) return { label: 'Weekly', days: 7 }
      if (medianDays <= 17) return { label: 'Biweekly', days: 14 }
      if (medianDays <= 45) return { label: 'Monthly', days: 30 }
      if (medianDays <= 110) return { label: 'Quarterly', days: 90 }
      if (medianDays <= 370) return { label: 'Yearly', days: 365 }
      return { label: 'Recurring', days: Math.round(medianDays) }
    }

    const recurringMap = new Map<string, { dates: Date[]; amounts: number[] }>()

    recurringWindow.forEach((transaction) => {
      const recipientName = normalizeDonationRecipient(transaction.description)
      const existing = recurringMap.get(recipientName)
      const transactionDate = new Date(transaction.date)

      if (!existing) {
        recurringMap.set(recipientName, {
          dates: [transactionDate],
          amounts: [Math.abs(transaction.amount)],
        })
        return
      }

      existing.dates.push(transactionDate)
      existing.amounts.push(Math.abs(transaction.amount))
      recurringMap.set(recipientName, existing)
    })

    const recurring = Array.from(recurringMap.entries())
      .map(([name, data]) => {
        if (data.dates.length < 2) return null
        const sortedDates = [...data.dates].sort(
          (a, b) => a.getTime() - b.getTime()
        )
        const intervals = sortedDates
          .slice(1)
          .map((date, index) => {
            const prevDate = sortedDates[index]
            return Math.round(
              (date.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          })
          .filter((interval) => interval > 0)

        if (intervals.length === 0) return null

        const medianInterval = getMedian(intervals)
        const cadence = cadenceFromMedian(medianInterval)
        const lastDate = sortedDates[sortedDates.length - 1]
        const nextDate = new Date(lastDate)
        nextDate.setDate(nextDate.getDate() + cadence.days)
        const average =
          data.amounts.reduce((sum, value) => sum + value, 0) /
          data.amounts.length

        return {
          name,
          average,
          cadence: cadence.label,
          lastDate: lastDate.toLocaleDateString('en-US'),
          nextDate: nextDate.toLocaleDateString('en-US'),
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .sort((a, b) => b.average - a.average)
      .slice(0, 3)

    return {
      entries,
      causes,
      recurring,
      total,
      hasData: recentDonations.length > 0,
    }
  }, [
    getMedian,
    inferDonationCause,
    normalizeDonationRecipient,
    transformedTransactions,
  ])

  const recentTransactions = useMemo(
    () =>
      [...transactionDateEntries]
        .sort(
          (a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()
        )
        .slice(0, 5)
        .map(({ transaction }) => transaction),
    [transactionDateEntries]
  )

  const spendingData = useMemo(
    () =>
      analyzeSpendingPatterns(transformedTransactions).map((pattern) => ({
        category: pattern.category,
        amount: pattern.totalSpent,
        percentage: pattern.percentageOfTotal,
        color: getCategoryColor(pattern.category),
      })),
    [transformedTransactions]
  )

  const cashFlowData = useMemo(() => {
    const monthWindows = Array.from({ length: 6 }, (_, index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - index))
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, '0')}`
      return {
        monthKey,
        label: date.toLocaleDateString('en-US', { month: 'short' }),
      }
    })

    const monthlyTotals = new Map(
      monthWindows.map(({ monthKey, label }) => [
        monthKey,
        { date: label, income: 0, expenses: 0 },
      ])
    )

    transactionDateEntries.forEach(({ transaction, monthKey }) => {
      const bucket = monthlyTotals.get(monthKey)
      if (!bucket) return

      if (transaction.type === 'INCOME') {
        bucket.income += transaction.amount
        return
      }

      if (transaction.type === 'EXPENSE') {
        bucket.expenses += Math.abs(transaction.amount)
      }
    })

    return monthWindows.map(({ monthKey }) => {
      const totals = monthlyTotals.get(monthKey)
      const income = totals?.income ?? 0
      const expenses = totals?.expenses ?? 0
      return {
        date: totals?.date ?? '',
        income,
        expenses,
        net: income - expenses,
      }
    })
  }, [transactionDateEntries])

  const expenseTotalsByDay = useMemo(() => {
    const totals = new Map<string, number>()

    transactionDateEntries.forEach(({ transaction, dayKey }) => {
      if (transaction.type !== 'EXPENSE') {
        return
      }
      totals.set(
        dayKey,
        (totals.get(dayKey) ?? 0) + Math.abs(transaction.amount)
      )
    })

    return totals
  }, [transactionDateEntries])

  const { netWorth, netWorthSummaryItems, hasNetWorthData } = useMemo(() => {
    const assets = totalBalance
    const liabilities = 0
    const cashReserveValue = accounts
      .filter(
        (account) => account.type === 'CHECKING' || account.type === 'SAVINGS'
      )
      .reduce((total, account) => total + account.balance, 0)
    const investmentTotalValue = accounts
      .filter((account) => account.type === 'INVESTMENT')
      .reduce((total, account) => total + account.balance, 0)

    return {
      netWorth: assets - liabilities,
      netWorthSummaryItems: [
        { label: 'Monthly income', value: monthlyIncome },
        { label: 'Monthly expenses', value: monthlyExpenses },
        { label: 'Investments', value: investmentTotalValue },
        { label: 'Cash reserve', value: cashReserveValue },
      ],
      hasNetWorthData: accounts.length > 0 || transactions.length > 0,
    }
  }, [
    accounts,
    monthlyExpenses,
    monthlyIncome,
    totalBalance,
    transactions.length,
  ])

  const { forecastAverage, forecastProjected, forecastRange } = useMemo(() => {
    const dailyExpenses = Array.from({ length: 30 }, (_, index) => {
      const day = new Date()
      day.setDate(day.getDate() - (29 - index))
      const dayKey = day.toISOString().slice(0, 10)
      return expenseTotalsByDay.get(dayKey) ?? 0
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
    const forecastAverageValue =
      hasForecast && recentAverage > 0 ? recentAverage : undefined
    const forecastProjectedValue =
      forecastAverageValue !== undefined ? forecastAverageValue * 30 : undefined
    const rawRangeLow = getRangePercentile(0.25)
    const rawRangeTypical = getRangePercentile(0.5)
    const rawRangeHigh = getRangePercentile(0.85)
    const normalizedLow = Math.min(rawRangeLow, rawRangeTypical, rawRangeHigh)
    const normalizedHigh = Math.max(rawRangeLow, rawRangeTypical, rawRangeHigh)
    const normalizedTypical = Math.min(
      Math.max(rawRangeTypical, normalizedLow),
      normalizedHigh
    )

    return {
      forecastAverage: forecastAverageValue,
      forecastProjected: forecastProjectedValue,
      forecastRange: hasForecast
        ? {
            low: normalizedLow,
            typical: normalizedTypical,
            high: normalizedHigh,
          }
        : undefined,
    }
  }, [expenseTotalsByDay])

  const securitySnapshot = useMemo(() => {
    const reviewThreshold = 600
    const recentWindowStart = new Date()
    recentWindowStart.setDate(recentWindowStart.getDate() - 14)
    const recentWindowStartTimestamp = recentWindowStart.getTime()

    const reviewItems = transactionDateEntries.filter(
      ({ transaction, transactionDate }) =>
        transaction.type === 'EXPENSE' &&
        Math.abs(transaction.amount) >= reviewThreshold &&
        transactionDate.getTime() >= recentWindowStartTimestamp
    ).length

    const creditCardsTracked = accounts.filter(
      (account) => account.type === 'CREDIT_CARD'
    ).length

    return {
      reviewItems,
      connectedAccounts: accounts.length,
      creditCardsTracked,
    }
  }, [accounts, transactionDateEntries])

  const dataQualitySnapshot = useMemo(() => {
    const uncategorizedCount = transactions.filter((transaction) => {
      const categoryName =
        transaction.categoryRelation?.name ??
        categoryLookup.get(transaction.categoryId ?? '') ??
        transaction.category

      return (
        !categoryName ||
        categoryName === 'Other' ||
        categoryName === 'Uncategorized'
      )
    }).length

    const duplicateBuckets = new Map<string, number>()
    transactionDateEntries.forEach(({ transaction, dayKey }) => {
      const normalizedDescription = transaction.description
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
      const amountKey = Math.abs(transaction.amount).toFixed(2)
      const bucketKey = `${dayKey}|${transaction.type}|${amountKey}|${normalizedDescription}`
      duplicateBuckets.set(
        bucketKey,
        (duplicateBuckets.get(bucketKey) ?? 0) + 1
      )
    })

    const possibleDuplicates = Array.from(duplicateBuckets.values()).reduce(
      (count, bucketSize) => count + Math.max(0, bucketSize - 1),
      0
    )

    const staleThresholdMs = 7 * 24 * 60 * 60 * 1000
    const now = Date.now()
    const staleAccounts = accounts.filter((account) => {
      if (!account.updatedAt) {
        return false
      }
      const updatedAtMs = new Date(account.updatedAt).getTime()
      if (!Number.isFinite(updatedAtMs)) {
        return false
      }
      return now - updatedAtMs > staleThresholdMs
    }).length

    return {
      uncategorizedCount,
      possibleDuplicates,
      staleAccounts,
    }
  }, [accounts, categoryLookup, transactionDateEntries, transactions])

  if (isLoading) {
    return (
      <>
        {demoLoadingModal}
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
      </>
    )
  }

  return (
    <>
      {demoLoadingModal}
      <div className="space-y-8 pb-8">
        {isDemoMode ? (
          <FadeIn>
            <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                    Demo mode
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    Explore real workflows with curated data.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try the guided walkthrough to see the key features in
                    action.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsWalkthroughOpen(true)}
                  >
                    Start walkthrough
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      localStorage.removeItem('finance-demo-walkthrough')
                      setIsWalkthroughOpen(true)
                    }}
                  >
                    Reset tour
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ) : null}

        {/* Header */}
        <FadeIn>
          <div
            className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between"
            data-demo-step="demo-welcome"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Dashboard
              </p>
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Here&apos;s your financial overview for this month
              </p>
            </div>
            <div className="flex flex-wrap gap-3" data-demo-step="demo-actions">
              <AddTransactionDialog
                buttonClassName={highContrastActionButtonClass}
              />
              {isDemoMode ? (
                <Button
                  variant="outline"
                  disabled
                  className={
                    'min-h-11 border border-primary/55 bg-primary/18 text-primary-foreground ' +
                    'shadow-[0_0_0_1px_hsl(var(--primary)/0.35)] disabled:opacity-75'
                  }
                >
                  Connect Bank Account
                </Button>
              ) : (
                <TellerLink
                  onSuccess={handleTellerSuccess}
                  buttonClassName={highContrastActionButtonClass}
                />
              )}
            </div>
          </div>
        </FadeIn>

        {/* Financial Overview Cards */}
        <FadeIn delay={0.1}>
          <div data-demo-step="demo-overview-cards">
            <FinancialOverviewCards
              totalBalance={totalBalance}
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
              netIncome={netIncome}
              creditCardUtilization={creditCardUtilization}
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card
              className="border-border/70 bg-card/90 shadow-sm xl:col-span-2"
              data-demo-step="demo-cashflow-planning-strip"
            >
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Cash Flow Planning Strip</CardTitle>
                    <CardDescription>
                      Projected income and outflows over the next 14 and 30
                      days.
                    </CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Low-cash threshold:{' '}
                    {formatCurrency(cashFlowPlanningSnapshot.lowCashThreshold)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Next 14 days
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatCurrency(cashFlowPlanningSnapshot.net14)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(cashFlowPlanningSnapshot.income14)} in ·{' '}
                      {formatCurrency(cashFlowPlanningSnapshot.expenses14)} out
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Next 30 days
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatCurrency(cashFlowPlanningSnapshot.net30)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(cashFlowPlanningSnapshot.income30)} in ·{' '}
                      {formatCurrency(cashFlowPlanningSnapshot.expenses30)} out
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Low-cash days
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {cashFlowPlanningSnapshot.lowCashDays}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Within projected 30-day balance run.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/60 bg-muted/15 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      Starting cash
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatCurrency(liquidCashBalance)}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Checking + savings balance baseline.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-1">
                    {cashFlowPlanningSnapshot.timeline.map((day) => (
                      <div
                        key={day.dayKey}
                        className={`h-2 rounded-full ${
                          day.isLowCashDay
                            ? 'bg-rose-500/90'
                            : day.delta > 0
                              ? 'bg-emerald-500/80'
                              : day.delta < 0
                                ? 'bg-amber-500/80'
                                : 'bg-muted'
                        }`}
                        title={`${day.day.toLocaleDateString('en-US')}: ${formatCurrency(
                          day.endingBalance
                        )}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Today</span>
                    <span>Day 14</span>
                    <span>Day 30</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Upcoming expected cash events
                  </p>
                  {cashFlowPlanningSnapshot.upcomingEvents.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {cashFlowPlanningSnapshot.upcomingEvents.map((event) => (
                        <div
                          key={event.id}
                          className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/10 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {event.title}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {event.date.toLocaleDateString('en-US')} ·{' '}
                              {event.source === 'subscription'
                                ? 'subscription'
                                : 'predicted pattern'}
                            </p>
                          </div>
                          <p
                            className={`text-sm font-semibold ${
                              event.kind === 'income'
                                ? 'text-emerald-600 dark:text-emerald-300'
                                : 'text-rose-600 dark:text-rose-300'
                            }`}
                          >
                            {event.kind === 'income' ? '+' : '-'}
                            {formatCurrency(event.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-5 text-center">
                      <p className="text-sm font-medium text-foreground">
                        Not enough recurring signal yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add recurring transactions or subscriptions to generate
                        forward cash planning.
                      </p>
                    </div>
                  )}
                  {isSubscriptionsLoading ? (
                    <p className="text-[11px] text-muted-foreground">
                      Refreshing subscription schedule...
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card
              className="border-border/70 bg-card/90 shadow-sm"
              data-demo-step="demo-budget-forecast"
            >
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Budget Forecast</CardTitle>
                    <CardDescription>
                      Snapshot only. Open budgets for full analysis.
                    </CardDescription>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/budgets">Open</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                {budgetForecastItems.length > 0 ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Over risk
                        </p>
                        <p className="mt-1 text-lg font-semibold text-rose-600 dark:text-rose-300">
                          {budgetForecastSummary.overCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Warning
                        </p>
                        <p className="mt-1 text-lg font-semibold text-amber-700 dark:text-amber-300">
                          {budgetForecastSummary.warningCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border/60 bg-muted/10 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Projected overrun
                        </p>
                        <p className="mt-1 text-lg font-semibold text-foreground">
                          {formatCurrency(
                            budgetForecastSummary.projectedOverrunTotal
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {budgetForecastSummary.previewItems.map((forecast) => (
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
                                Projected{' '}
                                {forecast.projectedUtilization.toFixed(0)}% ·{' '}
                                {formatCurrency(forecast.projectedSpend)}
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
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
                    <p className="text-sm font-medium text-foreground">
                      No active budgets yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create budgets to unlock spend forecasting.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </FadeIn>

        {/* Main Content Grid */}
        <FadeIn delay={0.15}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Net Worth Card */}
            <div data-demo-step="demo-net-worth" className="h-full">
              <NetWorthSummaryCard
                netWorth={netWorth}
                summaryItems={netWorthSummaryItems}
                forecastRange={forecastRange}
                forecastAverage={forecastAverage}
                forecastProjected={forecastProjected}
                hasData={hasNetWorthData}
                className="h-full"
              />
            </div>

            {/* Spending Chart */}
            <div data-demo-step="demo-spending">
              <SpendingChart
                data={spendingData}
                totalSpending={monthlyExpenses}
                previousMonthTotal={monthlyExpenses * 0.95} // Mock data
                className="h-full"
              />
            </div>

            {/* Reminders */}
            <div className="h-full" data-demo-step="demo-reminders">
              <RemindersCard
                reminders={reminders}
                action={
                  <AddReminderModal
                    onReminderAdded={async (reminder) => {
                      await createReminderMutation.mutateAsync(reminder)
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
                  updateReminderMutation.mutate({
                    id,
                    updates: { completed: true },
                  })
                }}
                onClearCompletedReminders={() => {
                  clearCompletedRemindersMutation.mutate()
                }}
                isClearingCompleted={clearCompletedRemindersMutation.isPending}
                className="h-full"
              />
            </div>
          </div>
        </FadeIn>

        {/* Second Row */}
        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Cash Flow Chart */}
            <div
              className="lg:col-span-2 h-full"
              data-demo-step="demo-cashflow"
            >
              <CashFlowChart data={cashFlowData} className="h-full" />
            </div>

            {/* AI Insights */}
            <div className="lg:col-span-1 h-full">
              <div data-demo-step="demo-insights">
                <AIFinancialInsights
                  transactions={transformedTransactions}
                  budgets={transformedBudgets}
                  goals={transformedGoals}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Third Row - Credit Utilization */}
        <FadeIn delay={0.25}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Credit Utilization */}
            <div data-demo-step="demo-credit-utilization" className="h-full">
              <CreditUtilizationCard
                creditCards={creditCards}
                className="h-full"
              />
            </div>

            {/* Analytics Dashboard */}
            <div data-demo-step="demo-analytics" className="h-full">
              <AnalyticsDashboard
                transactions={transformedTransactions}
                budgets={transformedBudgets}
                goals={transformedGoals}
                className="h-full"
              />
            </div>
          </div>
        </FadeIn>

        {/* Fourth Row */}
        <FadeIn delay={0.3}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* Recent Transactions */}
            <Card
              className="border-border/70 bg-card/90 shadow-sm lg:col-span-2 h-full"
              data-demo-step="demo-recent-transactions"
            >
              <CardHeader className="border-b border-border/60 pb-3">
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
                    const CategoryIcon = getCategoryIconComponent(categoryName)
                    return (
                      <div
                        key={transaction.id}
                        className={
                          'flex items-center justify-between rounded-xl border border-border/50 ' +
                          'bg-card/70 p-4 shadow-sm transition-colors hover:bg-muted/30'
                        }
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <div
                            className={
                              'flex h-12 w-12 items-center justify-center rounded-xl ' +
                              'text-white shadow-md'
                            }
                            style={{
                              backgroundColor: getCategoryColor(categoryName),
                            }}
                          >
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate">
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
                      'rounded-xl border border-dashed border-border/60 bg-muted/10 ' +
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
              <Card
                className="border-border/70 bg-card/90 shadow-sm h-full"
                id="budget-progress"
                data-demo-step="demo-budget-progress"
              >
                <CardHeader className="border-b border-border/60 pb-3">
                  <CardTitle>Budget Progress</CardTitle>
                  <CardDescription>This month&apos;s spending</CardDescription>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCreateBudgetModalOpen(true)}
                      >
                        Create budget
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Goals Progress */}
              <Card
                className="border-border/70 bg-card/90 shadow-sm h-full"
                data-demo-step="demo-goals-progress"
              >
                <CardHeader className="border-b border-border/60 pb-3">
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsCreateGoalModalOpen(true)}
                      >
                        Set a goal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div data-demo-step="demo-donations" className="h-full">
                <DonationsCard
                  entries={donationSummary.entries}
                  causes={donationSummary.causes}
                  recurring={donationSummary.recurring}
                  total={donationSummary.total}
                  hasData={donationSummary.hasData}
                  className="h-full"
                />
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Security &amp; Privacy</CardTitle>
                    <CardDescription>
                      Audit activity, access sessions, and data controls.
                    </CardDescription>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/security">Open security center</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
                <div
                  className={
                    'rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm'
                  }
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Review items
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {securitySnapshot.reviewItems}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    High-value expenses in the last 14 days.
                  </p>
                </div>
                <div
                  className={
                    'rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm'
                  }
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Connected accounts
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {securitySnapshot.connectedAccounts}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Account connections monitored in one place.
                  </p>
                </div>
                <div
                  className={
                    'rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm'
                  }
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Credit cards tracked
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {securitySnapshot.creditCardsTracked}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cards included in utilization and alert checks.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card/90 shadow-sm">
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Data Quality Center</CardTitle>
                    <CardDescription>
                      Keep transactions accurate before insights and forecasts.
                    </CardDescription>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/transactions">Review data</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3">
                <div
                  className={
                    'rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm'
                  }
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Uncategorized
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {dataQualitySnapshot.uncategorizedCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Transactions ready for category review.
                  </p>
                </div>
                <div
                  className={
                    'rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm'
                  }
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Possible duplicates
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {dataQualitySnapshot.possibleDuplicates}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Similar entries on the same day and amount.
                  </p>
                </div>
                <div
                  className={
                    'rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm'
                  }
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Stale accounts
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {dataQualitySnapshot.staleAccounts}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Accounts not refreshed in the last 7 days.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </FadeIn>
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
      <CreateGoalModal
        open={isCreateGoalModalOpen}
        onOpenChange={setIsCreateGoalModalOpen}
        onSubmit={async (goalData) => {
          await createGoalMutation.mutateAsync(goalData)
          setIsCreateGoalModalOpen(false)
        }}
        isLoading={createGoalMutation.isPending}
      />
    </>
  )
}
