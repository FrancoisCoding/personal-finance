'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { useBillingStatus } from '@/hooks/use-billing-status'
import { useNotifications } from '@/components/notification-system'
import {
  CreditCard,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Trash2,
  Edit,
  Zap,
  Loader2,
  Bell,
} from 'lucide-react'
import { formatCurrency, formatDate, getCategoryColor } from '@/lib/utils'
import { getCategoryIconComponent } from '@/lib/category-icons'
import {
  useSubscriptions,
  useCreateSubscription,
  useDeleteSubscription,
  useCategories,
  useTransactions,
  useUpdateSubscription,
} from '@/hooks/use-finance-data'
import type { Subscription, Transaction } from '@/hooks/use-finance-data'

const normalizeDescription = (description: string) =>
  description
    .toLowerCase()
    .replace(
      /\b(payment|purchase|pos|debit|credit|card|online|recurring|subscription|bill|transfer)\b/g,
      ''
    )
    .replace(/[^a-z\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const toTitleCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const getMedian = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

const getMostCommon = (values: Array<string | null | undefined>) => {
  const counts = new Map<string, number>()
  for (const value of values) {
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  let top: string | undefined
  let max = 0
  counts.forEach((count, value) => {
    if (count > max) {
      max = count
      top = value
    }
  })
  return top
}

const DAY_MS = 1000 * 60 * 60 * 24

type DetectedBillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

const detectBillingCycle = (intervals: number[]) => {
  const cycles: Array<{
    cycle: DetectedBillingCycle
    targetDays: number
    tolerance: number
  }> = [
    { cycle: 'MONTHLY', targetDays: 30, tolerance: 5 },
    { cycle: 'QUARTERLY', targetDays: 90, tolerance: 12 },
    { cycle: 'YEARLY', targetDays: 365, tolerance: 20 },
  ]

  return cycles.find((cycle) =>
    intervals.every(
      (interval) => Math.abs(interval - cycle.targetDays) <= cycle.tolerance
    )
  )
}

const addCycleToDate = (date: Date, cycle: DetectedBillingCycle) => {
  const next = new Date(date)
  if (cycle === 'MONTHLY') {
    next.setMonth(next.getMonth() + 1)
    return next
  }
  if (cycle === 'QUARTERLY') {
    next.setMonth(next.getMonth() + 3)
    return next
  }
  next.setFullYear(next.getFullYear() + 1)
  return next
}

const getMonthlyEquivalent = (amount: number, cycle: DetectedBillingCycle) => {
  if (cycle === 'MONTHLY') return amount
  if (cycle === 'QUARTERLY') return amount / 3
  return amount / 12
}

const getSubscriptionCycleDays = (cycle: Subscription['billingCycle']) => {
  if (cycle === 'WEEKLY') return 7
  if (cycle === 'MONTHLY') return 30
  if (cycle === 'QUARTERLY') return 90
  if (cycle === 'YEARLY') return 365
  return 30
}

const getSubscriptionMonthlyEquivalent = (
  amount: number,
  cycle: Subscription['billingCycle']
) => {
  if (cycle === 'WEEKLY') return amount * 4.33
  if (cycle === 'MONTHLY') return amount
  if (cycle === 'QUARTERLY') return amount / 3
  if (cycle === 'YEARLY') return amount / 12
  return amount
}

export default function SubscriptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { isDemoMode } = useDemoMode()
  const { data: billingData, isLoading: isBillingLoading } = useBillingStatus()
  const { addNotification, setShowNotificationCenter } = useNotifications()
  const { data: subscriptions = [], isLoading } = useSubscriptions()
  const { data: categories = [] } = useCategories()
  const { data: transactions = [] } = useTransactions()
  const createSubscriptionMutation = useCreateSubscription()
  const updateSubscriptionMutation = useUpdateSubscription()
  const deleteSubscriptionMutation = useDeleteSubscription()
  const isUpdatingSubscription = updateSubscriptionMutation.isPending
  const isDeletingSubscription = deleteSubscriptionMutation.isPending
  const hasProAccess = isDemoMode || billingData?.currentPlan === 'PRO'

  const [addingDetected, setAddingDetected] = useState<Set<string>>(new Set())
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated' && !isDemoMode) {
      router.push('/auth/login')
    }
  }, [status, router, isDemoMode])

  const activeSubscriptions = subscriptions.filter((s) => s.isActive)
  const totalMonthlyCost = activeSubscriptions.reduce((sum, sub) => {
    const multiplier =
      sub.billingCycle === 'YEARLY'
        ? 1 / 12
        : sub.billingCycle === 'WEEKLY'
          ? 4.33
          : sub.billingCycle === 'QUARTERLY'
            ? 1 / 3
            : 1
    return sum + sub.amount * multiplier
  }, 0)

  const totalYearlyCost = activeSubscriptions.reduce((sum, sub) => {
    const multiplier =
      sub.billingCycle === 'MONTHLY'
        ? 12
        : sub.billingCycle === 'WEEKLY'
          ? 52
          : sub.billingCycle === 'QUARTERLY'
            ? 4
            : 1
    return sum + sub.amount * multiplier
  }, 0)

  const upcomingRenewals = activeSubscriptions.filter((sub) => {
    const nextBilling = new Date(sub.nextBillingDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return nextBilling <= thirtyDaysFromNow
  })

  const getSubscriptionStatus = (subscription: Subscription) => {
    const nextBilling = new Date(subscription.nextBillingDate)
    const today = new Date()
    const daysUntilRenewal = Math.ceil(
      (nextBilling.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilRenewal <= 3) {
      return {
        status: 'urgent',
        icon: AlertTriangle,
        color: 'text-rose-600',
        bgColor: 'bg-rose-200/40',
      }
    }

    if (daysUntilRenewal <= 7) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-amber-600',
        bgColor: 'bg-amber-200/40',
      }
    }

    return {
      status: 'good',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-200/40',
    }
  }

  const detectedSubscriptions = useMemo(() => {
    const existingKeys = new Set(
      subscriptions.map((subscription) =>
        normalizeDescription(subscription.name)
      )
    )

    const expenseTransactions = transactions.filter(
      (transaction) => transaction.type === 'EXPENSE'
    )

    const grouped = new Map<string, Transaction[]>()
    expenseTransactions.forEach((transaction) => {
      const normalized = normalizeDescription(transaction.description)
      if (!normalized || normalized.length < 3) return
      if (!grouped.has(normalized)) grouped.set(normalized, [])
      grouped.get(normalized)!.push(transaction)
    })

    const results: Array<{
      id: string
      name: string
      amount: number
      billingCycle: DetectedBillingCycle
      nextBillingDate: Date
      lastChargeDate: Date
      transactionCount: number
      categoryId?: string
      categoryName?: string
      confidence: number
      monthlyEquivalent: number
    }> = []

    grouped.forEach((items, key) => {
      if (items.length < 3) return
      if (existingKeys.has(key)) return

      const sorted = [...items].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      const intervals = sorted
        .slice(1)
        .map((item, index) => {
          const prevDate = new Date(sorted[index].date)
          const currentDate = new Date(item.date)
          return Math.round(
            (currentDate.getTime() - prevDate.getTime()) / DAY_MS
          )
        })
        .filter((interval) => interval > 0)

      if (intervals.length < 2) return
      const cycleMatch = detectBillingCycle(intervals)
      if (!cycleMatch) return

      const amounts = sorted.map((item) => Math.abs(item.amount))
      const median = getMedian(amounts)
      if (!median || Number.isNaN(median)) return

      const averageDeviation =
        amounts.reduce((sum, value) => sum + Math.abs(value - median), 0) /
        amounts.length
      const deviationRatio = averageDeviation / median

      if (deviationRatio > 0.25) return

      const intervalDeviation =
        intervals.reduce(
          (sum, value) => sum + Math.abs(value - cycleMatch.targetDays),
          0
        ) / intervals.length
      const intervalScore = Math.max(
        0,
        1 - intervalDeviation / cycleMatch.tolerance
      )
      const amountScore = Math.max(0, 1 - deviationRatio / 0.25)
      const confidence = Math.min(
        0.97,
        Math.max(0.55, (intervalScore + amountScore) / 2)
      )

      const lastCharge = sorted[sorted.length - 1]
      const nextBillingDate = addCycleToDate(
        new Date(lastCharge.date),
        cycleMatch.cycle
      )

      const categoryId = getMostCommon(sorted.map((item) => item.categoryId))
      const categoryName = categoryId
        ? categories.find((category) => category.id === categoryId)?.name
        : undefined

      results.push({
        id: key,
        name: toTitleCase(key),
        amount: median,
        billingCycle: cycleMatch.cycle,
        nextBillingDate,
        lastChargeDate: new Date(lastCharge.date),
        transactionCount: sorted.length,
        categoryId,
        categoryName,
        confidence,
        monthlyEquivalent: getMonthlyEquivalent(median, cycleMatch.cycle),
      })
    })

    return results.sort((a, b) => b.monthlyEquivalent - a.monthlyEquivalent)
  }, [categories, subscriptions, transactions])

  const detectedMonthlyCost = detectedSubscriptions.reduce(
    (sum, item) => sum + item.monthlyEquivalent,
    0
  )

  const subscriptionIntelligence = useMemo(() => {
    const now = new Date()
    const expenseTransactionEntries = transactions
      .filter((transaction) => transaction.type === 'EXPENSE')
      .map((transaction) => ({
        transaction,
        transactionDate: new Date(transaction.date),
        normalizedDescription: normalizeDescription(transaction.description),
      }))

    const items = activeSubscriptions
      .map((subscription) => {
        const normalizedName = normalizeDescription(subscription.name)
        const matchingCharges = expenseTransactionEntries
          .filter((entry) => {
            if (!normalizedName || !entry.normalizedDescription) {
              return false
            }
            return (
              entry.normalizedDescription === normalizedName ||
              entry.normalizedDescription.includes(normalizedName) ||
              normalizedName.includes(entry.normalizedDescription)
            )
          })
          .sort(
            (a, b) => b.transactionDate.getTime() - a.transactionDate.getTime()
          )

        const latestCharge = matchingCharges[0]
        const priorAmounts = matchingCharges
          .slice(1, 7)
          .map((entry) => Math.abs(entry.transaction.amount))
        const baselineAmount =
          priorAmounts.length > 0 ? getMedian(priorAmounts) : undefined
        const latestAmount = latestCharge
          ? Math.abs(latestCharge.transaction.amount)
          : undefined

        const priceIncreasePercent =
          baselineAmount && latestAmount && latestAmount > baselineAmount
            ? ((latestAmount - baselineAmount) / baselineAmount) * 100
            : undefined
        const hasPriceIncrease =
          priceIncreasePercent !== undefined && priceIncreasePercent >= 10

        const cycleDays = getSubscriptionCycleDays(subscription.billingCycle)
        const daysSinceLastCharge = latestCharge
          ? Math.ceil(
              (now.getTime() - latestCharge.transactionDate.getTime()) / DAY_MS
            )
          : null
        const likelyUnused =
          daysSinceLastCharge !== null
            ? daysSinceLastCharge >
              cycleDays + Math.max(10, Math.round(cycleDays * 0.4))
            : false

        const nextBillingDate = new Date(subscription.nextBillingDate)
        const daysUntilRenewal = Math.ceil(
          (nextBillingDate.getTime() - now.getTime()) / DAY_MS
        )

        const monthlyEquivalent = getSubscriptionMonthlyEquivalent(
          subscription.amount,
          subscription.billingCycle
        )
        const monthlyIncreaseAmount =
          hasPriceIncrease && baselineAmount && latestAmount
            ? getSubscriptionMonthlyEquivalent(
                latestAmount - baselineAmount,
                subscription.billingCycle
              )
            : 0

        let riskScore = 0
        if (daysUntilRenewal <= 3) {
          riskScore += 3
        } else if (daysUntilRenewal <= 7) {
          riskScore += 2
        } else if (daysUntilRenewal <= 14) {
          riskScore += 1
        }
        if (hasPriceIncrease) {
          riskScore += 2
        }
        if (likelyUnused) {
          riskScore += 2
        }
        if (monthlyEquivalent >= 60) {
          riskScore += 1
        }

        const riskLevel: 'high' | 'medium' | 'low' =
          riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low'
        const potentialMonthlySavings =
          (likelyUnused ? monthlyEquivalent : 0) + monthlyIncreaseAmount

        const signals: string[] = []
        if (daysUntilRenewal <= 7) {
          signals.push(
            daysUntilRenewal <= 1
              ? 'Renews within 24h'
              : `Renews in ${daysUntilRenewal} days`
          )
        }
        if (hasPriceIncrease && priceIncreasePercent) {
          signals.push(`Price up ${priceIncreasePercent.toFixed(1)}%`)
        }
        if (likelyUnused && daysSinceLastCharge !== null) {
          signals.push(`No charge for ${daysSinceLastCharge} days`)
        }

        return {
          subscription,
          daysUntilRenewal,
          riskLevel,
          riskScore,
          hasPriceIncrease,
          priceIncreasePercent,
          likelyUnused,
          daysSinceLastCharge,
          potentialMonthlySavings,
          signals,
        }
      })
      .sort(
        (a, b) =>
          b.riskScore - a.riskScore ||
          b.potentialMonthlySavings - a.potentialMonthlySavings
      )

    const byId = new Map(items.map((item) => [item.subscription.id, item]))
    const highRiskCount = items.filter(
      (item) => item.riskLevel === 'high'
    ).length
    const priceIncreaseCount = items.filter(
      (item) => item.hasPriceIncrease
    ).length
    const likelyUnusedCount = items.filter((item) => item.likelyUnused).length
    const estimatedSavings = items.reduce(
      (sum, item) => sum + item.potentialMonthlySavings,
      0
    )
    const highlightedItems = items.filter(
      (item) => item.riskLevel !== 'low' || item.signals.length > 0
    )

    return {
      byId,
      highRiskCount,
      priceIncreaseCount,
      likelyUnusedCount,
      estimatedSavings,
      highlightedItems,
    }
  }, [activeSubscriptions, transactions])

  if (
    status === 'loading' ||
    isLoading ||
    (!isDemoMode && !!session?.user?.id && isBillingLoading)
  ) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`subscription-summary-${index}`}
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

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card
              key={`subscription-panel-${index}`}
              className="border-border/60 bg-card/80 shadow-sm"
            >
              <CardHeader className="border-b border-border/60">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, rowIndex) => (
                  <div
                    key={`subscription-row-${index}-${rowIndex}`}
                    className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/20 p-3"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="border-b border-border/60">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-60" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, rowIndex) => (
              <div
                key={`subscription-active-${rowIndex}`}
                className="rounded-2xl border border-border/60 bg-muted/20 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20 rounded" />
                    <Skeleton className="h-8 w-10 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session && !isDemoMode) {
    return null
  }

  const handleAddDetectedSubscription = (detected: {
    id: string
    name: string
    amount: number
    billingCycle: DetectedBillingCycle
    nextBillingDate: Date
    categoryId?: string
  }) => {
    setAddingDetected((prev) => new Set(prev).add(detected.id))
    createSubscriptionMutation.mutate(
      {
        name: detected.name,
        amount: detected.amount,
        billingCycle: detected.billingCycle,
        nextBillingDate: detected.nextBillingDate,
        categoryId: detected.categoryId,
        notes: 'Detected from recurring transactions',
        suppressSuccessToast: true,
      },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Subscription added',
            message: `"${detected.name}" is now tracked in your subscriptions.`,
            category: 'system',
          })
        },
        onSettled: () => {
          setAddingDetected((prev) => {
            const next = new Set(prev)
            next.delete(detected.id)
            return next
          })
        },
      }
    )
  }

  const handleDeleteSubscription = (subscriptionId: string) => {
    deleteSubscriptionMutation.mutate(subscriptionId)
  }

  const handleToggleSubscription = (subscriptionId: string) => {
    const subscription = subscriptions.find((s) => s.id === subscriptionId)
    if (!subscription) return
    updateSubscriptionMutation.mutate({
      id: subscriptionId,
      updates: { isActive: !subscription.isActive },
    })
  }

  const handleRenewalReminder = (
    subscription: Subscription,
    daysUntilRenewal: number
  ) => {
    addNotification({
      type: 'info',
      title: 'Renewal reminder set',
      message:
        `${subscription.name} renews in ${daysUntilRenewal} days ` +
        `on ${formatDate(subscription.nextBillingDate)}.`,
      category: 'reminder',
      dedupeKey: `subscription-reminder-${subscription.id}`,
      throttleMinutes: 60 * 24,
      action: {
        label: 'View alerts',
        onClick: () => setShowNotificationCenter(true),
      },
    })
    setShowNotificationCenter(true)
  }

  const handleConfirmCancel = () => {
    if (!cancelTarget) return
    const cancellationNote = `Cancellation requested ${new Date().toLocaleDateString(
      'en-US'
    )}`
    const nextNotes = cancelTarget.notes
      ? `${cancelTarget.notes} | ${cancellationNote}`
      : cancellationNote

    updateSubscriptionMutation.mutate(
      {
        id: cancelTarget.id,
        updates: { isActive: false, notes: nextNotes },
        suppressSuccessToast: true,
      },
      {
        onSuccess: () => {
          addNotification({
            type: 'warning',
            title: 'Cancel subscription',
            message:
              `${cancelTarget.name} is paused here. Visit the provider to ` +
              'finish the cancellation and remove payment methods.',
            category: 'system',
            action: {
              label: 'View alerts',
              onClick: () => setShowNotificationCenter(true),
            },
          })
          setShowNotificationCenter(true)
          setCancelTarget(null)
        },
      }
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
      <div
        className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
        data-demo-step="demo-subscriptions-header"
      >
        <div className="space-y-2">
          <div
            className={
              'inline-flex items-center gap-2 rounded-full border ' +
              'border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground'
            }
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Auto-detected subscriptions
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Subscriptions
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            We detect recurring charges from your transactions and suggest
            subscriptions to track.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              toast({
                title: 'Scan complete',
                description: 'Detected subscriptions are up to date.',
              })
            }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Refresh detection
          </Button>
        </div>
      </div>

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        data-demo-step="demo-subscriptions-summary"
      >
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Active subscriptions
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {activeSubscriptions.length}
                </p>
              </div>
              <div
                className={
                  'flex h-10 w-10 items-center justify-center rounded-full ' +
                  'bg-emerald-500/10 text-emerald-500'
                }
              >
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Confirmed recurring charges
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Monthly cost
                </p>
                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
                  {formatCurrency(totalMonthlyCost)}
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
              Active subscriptions only
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Yearly cost
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {formatCurrency(totalYearlyCost)}
                </p>
              </div>
              <div
                className={
                  'flex h-10 w-10 items-center justify-center rounded-full ' +
                  'bg-emerald-500/10 text-emerald-500'
                }
              >
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Projected annual spend
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Detected candidates
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {detectedSubscriptions.length}
                </p>
              </div>
              <div
                className={
                  'flex h-10 w-10 items-center justify-center rounded-full ' +
                  'bg-emerald-500/10 text-emerald-500'
                }
              >
                <Zap className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {hasProAccess
                ? `${formatCurrency(detectedMonthlyCost)} monthly estimated · ${subscriptionIntelligence.highRiskCount} high-risk alerts`
                : `${formatCurrency(detectedMonthlyCost)} monthly estimated`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card
          className="border-border/60 bg-card/80 shadow-sm"
          data-demo-step="demo-subscriptions-detected"
        >
          <CardHeader className="border-b border-border/60">
            <CardTitle>Detected subscriptions</CardTitle>
            <CardDescription>
              Review these recurring charges and add the ones you want to track.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {detectedSubscriptions.length === 0 ? (
              <div
                className={
                  'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
                  'px-4 py-6 text-center'
                }
              >
                <p className="text-sm font-medium text-foreground">
                  No recurring patterns detected yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add more transactions to improve detection accuracy.
                </p>
              </div>
            ) : (
              detectedSubscriptions.map((detected) => {
                const categoryColor = detected.categoryName
                  ? getCategoryColor(detected.categoryName)
                  : '#9CA3AF'
                const CategoryIcon = detected.categoryName
                  ? getCategoryIconComponent(detected.categoryName)
                  : null
                const isAdding = addingDetected.has(detected.id)

                return (
                  <div
                    key={detected.id}
                    className={
                      'flex flex-col gap-4 rounded-2xl border border-border/60 ' +
                      'bg-muted/20 p-4 md:flex-row md:items-center md:justify-between'
                    }
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl border"
                        style={{
                          color: categoryColor,
                          backgroundColor: `${categoryColor}1A`,
                          borderColor: `${categoryColor}33`,
                        }}
                      >
                        {CategoryIcon ? (
                          <CategoryIcon className="h-5 w-5" />
                        ) : (
                          <CreditCard className="h-5 w-5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {detected.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(detected.amount)} per{' '}
                          {detected.billingCycle.toLowerCase()}
                        </p>
                        <div
                          className={
                            'flex flex-wrap items-center gap-2 text-xs ' +
                            'text-muted-foreground'
                          }
                        >
                          <span
                            className={
                              'rounded-full border border-border/60 ' +
                              'bg-muted/30 px-2 py-1'
                            }
                          >
                            {detected.transactionCount} charges found
                          </span>
                          <span
                            className={
                              'rounded-full border border-border/60 ' +
                              'bg-muted/30 px-2 py-1'
                            }
                          >
                            {Math.round(detected.confidence * 100)}% match
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right text-xs text-muted-foreground">
                        <p className="font-medium text-foreground">
                          Next charge
                        </p>
                        <p>{formatDate(detected.nextBillingDate)}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleAddDetectedSubscription({
                            id: detected.id,
                            name: detected.name,
                            amount: detected.amount,
                            billingCycle: detected.billingCycle,
                            nextBillingDate: detected.nextBillingDate,
                            categoryId: detected.categoryId,
                          })
                        }
                        disabled={
                          isAdding || createSubscriptionMutation.isPending
                        }
                      >
                        {isAdding ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        Add
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card
          className="border-border/60 bg-card/80 shadow-sm"
          data-demo-step="demo-subscriptions-renewals"
        >
          <CardHeader className="border-b border-border/60">
            <CardTitle>Upcoming renewals</CardTitle>
            <CardDescription>Next 30 days of renewals.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            {upcomingRenewals.length === 0 ? (
              <div
                className={
                  'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
                  'px-4 py-6 text-center'
                }
              >
                <p className="text-sm font-medium text-foreground">
                  No renewals coming up
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  You are all clear for the next 30 days.
                </p>
              </div>
            ) : (
              upcomingRenewals.slice(0, 5).map((subscription) => {
                const nextBilling = new Date(subscription.nextBillingDate)
                const daysUntilRenewal = Math.ceil(
                  (nextBilling.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                const insight = hasProAccess
                  ? subscriptionIntelligence.byId.get(subscription.id)
                  : null

                return (
                  <div
                    key={subscription.id}
                    className={
                      'flex flex-col gap-3 rounded-xl border border-border/60 ' +
                      'bg-muted/20 p-4 sm:flex-row sm:items-center ' +
                      'sm:justify-between'
                    }
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {subscription.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(subscription.amount)} ·{' '}
                        {subscription.billingCycle.toLowerCase()}
                      </p>
                      {insight && insight.signals.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {insight.signals.slice(0, 2).map((signal) => (
                            <span
                              key={`${subscription.id}-${signal}`}
                              className={
                                'rounded-full border border-border/60 ' +
                                'bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground'
                              }
                            >
                              {signal}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div className="text-right">
                        <span
                          className={
                            'inline-flex items-center rounded-full border px-2 py-0.5 ' +
                            'text-[11px] font-semibold ' +
                            (daysUntilRenewal <= 1
                              ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                              : daysUntilRenewal <= 7
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                                : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500')
                          }
                        >
                          {daysUntilRenewal <= 1
                            ? 'Renews soon'
                            : `In ${daysUntilRenewal} days`}
                        </span>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(subscription.nextBillingDate)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 rounded-full border border-border/60"
                        onClick={() =>
                          handleRenewalReminder(subscription, daysUntilRenewal)
                        }
                        aria-label={`Remind me about ${subscription.name}`}
                      >
                        <Bell className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {hasProAccess ? (
        <Card
          className="border-border/60 bg-card/80 shadow-sm"
          data-demo-step="demo-subscriptions-intelligence"
        >
          <CardHeader className="border-b border-border/60">
            <CardTitle>Subscription optimizer</CardTitle>
            <CardDescription>
              Renewal risk, price changes, and likely-unused subscriptions from
              recent billing activity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  High-risk renewals
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {subscriptionIntelligence.highRiskCount}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Price increases
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {subscriptionIntelligence.priceIncreaseCount}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Likely unused
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {subscriptionIntelligence.likelyUnusedCount}
                </p>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Estimated monthly savings
                </p>
                <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                  {formatCurrency(subscriptionIntelligence.estimatedSavings)}
                </p>
              </div>
            </div>

            {subscriptionIntelligence.highlightedItems.length === 0 ? (
              <div
                className={
                  'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
                  'px-4 py-6 text-center'
                }
              >
                <p className="text-sm font-medium text-foreground">
                  No intelligence alerts right now
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  As new charges arrive, this section will highlight risks and
                  optimization opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptionIntelligence.highlightedItems
                  .slice(0, 6)
                  .map((item) => {
                    const monthlyEquivalent = getSubscriptionMonthlyEquivalent(
                      item.subscription.amount,
                      item.subscription.billingCycle
                    )

                    return (
                      <div
                        key={item.subscription.id}
                        className={
                          'flex flex-col gap-3 rounded-xl border border-border/60 ' +
                          'bg-muted/15 p-4 sm:flex-row sm:items-start ' +
                          'sm:justify-between'
                        }
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">
                              {item.subscription.name}
                            </p>
                            <span
                              className={
                                'rounded-full border px-2 py-0.5 text-[11px] ' +
                                'font-semibold ' +
                                (item.riskLevel === 'high'
                                  ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                                  : item.riskLevel === 'medium'
                                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                                    : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500')
                              }
                            >
                              {item.riskLevel === 'high'
                                ? 'High risk'
                                : item.riskLevel === 'medium'
                                  ? 'Watch'
                                  : 'Stable'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(item.subscription.amount)} ·{' '}
                            {item.subscription.billingCycle.toLowerCase()} ·{' '}
                            {formatCurrency(monthlyEquivalent)}/month equivalent
                          </p>
                          <div className="flex flex-wrap items-center gap-1">
                            {item.signals.map((signal) => (
                              <span
                                key={`${item.subscription.id}-${signal}`}
                                className={
                                  'rounded-full border border-border/60 ' +
                                  'bg-muted/30 px-2 py-0.5 text-[11px] text-muted-foreground'
                                }
                              >
                                {signal}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {item.daysUntilRenewal <= 14 ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-9 w-9 rounded-full border border-border/60"
                              onClick={() =>
                                handleRenewalReminder(
                                  item.subscription,
                                  item.daysUntilRenewal
                                )
                              }
                              aria-label={`Remind me about ${item.subscription.name}`}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                          ) : null}
                          {item.likelyUnused ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleToggleSubscription(item.subscription.id)
                              }
                              disabled={isUpdatingSubscription}
                            >
                              Pause
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="border-b border-border/60">
            <CardTitle>Subscription optimizer</CardTitle>
            <CardDescription>
              Upgrade to Pro for cancellation and spend optimization
              recommendations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-muted-foreground">
              Pro unlocks price-change detection, likely-unused subscriptions,
              and projected monthly savings recommendations.
            </p>
            <Button asChild>
              <a href="/billing">Upgrade to Pro</a>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card
        className="border-border/60 bg-card/80 shadow-sm"
        data-demo-step="demo-subscriptions-active"
      >
        <CardHeader className="border-b border-border/60">
          <CardTitle>Active subscriptions</CardTitle>
          <CardDescription>
            Manage the subscriptions you are currently tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {subscriptions.length === 0 ? (
            <div
              className={
                'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
                'px-4 py-6 text-center'
              }
            >
              <p className="text-sm font-medium text-foreground">
                No active subscriptions yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a detected subscription to start tracking renewals.
              </p>
            </div>
          ) : (
            subscriptions.map((subscription) => {
              const category = categories.find(
                (c) => c.id === subscription.categoryId
              )
              const {
                icon: StatusIcon,
                color,
                bgColor,
              } = getSubscriptionStatus(subscription)
              const CategoryIcon = category
                ? getCategoryIconComponent(category.name)
                : null
              const categoryColor = category
                ? getCategoryColor(category.name)
                : '#9CA3AF'
              const nextBilling = new Date(subscription.nextBillingDate)
              const daysUntilRenewal = Math.ceil(
                (nextBilling.getTime() - new Date().getTime()) /
                  (1000 * 60 * 60 * 24)
              )
              const rowClassName =
                'flex flex-col gap-4 rounded-2xl border border-border/60 ' +
                'bg-muted/20 p-4 md:flex-row md:items-center md:justify-between ' +
                (!subscription.isActive ? 'opacity-60' : '')

              return (
                <div key={subscription.id} className={rowClassName}>
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl border"
                      style={{
                        color: categoryColor,
                        backgroundColor: `${categoryColor}1A`,
                        borderColor: `${categoryColor}33`,
                      }}
                    >
                      {CategoryIcon ? (
                        <CategoryIcon className="h-5 w-5" />
                      ) : (
                        <CreditCard className="w-5 h-5" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {subscription.name}
                        </p>
                        {!subscription.isActive && (
                          <span
                            className={
                              'rounded-full border border-border/60 ' +
                              'bg-muted/30 px-2 py-1 text-[11px] text-muted-foreground'
                            }
                          >
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {category?.name ? `${category.name} - ` : ''}
                        {subscription.billingCycle.toLowerCase()} billing
                      </p>
                      <div
                        className={
                          'flex flex-wrap items-center gap-2 text-xs text-muted-foreground'
                        }
                      >
                        <span
                          className={
                            'rounded-full border border-border/60 bg-muted/30 ' +
                            'px-2 py-1'
                          }
                        >
                          {formatCurrency(subscription.amount)}
                        </span>
                        <span
                          className={
                            'rounded-full border border-border/60 bg-muted/30 ' +
                            'px-2 py-1'
                          }
                        >
                          Renews in {daysUntilRenewal} days
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <StatusIcon className={`h-4 w-4 ${color}`} />
                      <span>{formatDate(subscription.nextBillingDate)}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleSubscription(subscription.id)}
                      disabled={isUpdatingSubscription}
                    >
                      {subscription.isActive ? 'Pause' : 'Activate'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 hover:text-rose-600"
                      onClick={() => setCancelTarget(subscription)}
                      disabled={isUpdatingSubscription}
                    >
                      Cancel
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSubscription(subscription.id)}
                      disabled={isDeletingSubscription}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div
                    className={`absolute right-0 top-0 h-full w-1 ${bgColor}`}
                  />
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(cancelTarget)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setCancelTarget(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Cancel subscription</DialogTitle>
            <DialogDescription>
              We will pause this subscription and guide you to finish
              cancellation with the provider.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
            <p className="font-medium text-foreground">Checklist</p>
            <ul className="space-y-2 text-muted-foreground">
              <li>Visit the provider billing page.</li>
              <li>Confirm cancellation and save the confirmation email.</li>
              <li>Remove saved payment methods if required.</li>
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>
              Keep active
            </Button>
            <Button
              onClick={handleConfirmCancel}
              disabled={!cancelTarget || isUpdatingSubscription}
            >
              Pause and start cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
