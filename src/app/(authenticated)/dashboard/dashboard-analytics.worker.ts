import type {
  ICashFlowEvent,
  ICashFlowPlanningSnapshot,
  IDashboardWorkerRequest,
  IDashboardWorkerResultPayload,
  IWorkerTransaction,
} from './dashboard-analytics.types'

interface ITransactionDateEntry {
  dayKey: string
  monthKey: string
  transaction: IWorkerTransaction
  transactionDate: Date
  transactionDateMs: number
}

const getMedian = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b)
  if (sorted.length === 0) return 0
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]
}

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

const createTransactionDateEntries = (transactions: IWorkerTransaction[]) => {
  const entries: ITransactionDateEntry[] = []

  transactions.forEach((transaction) => {
    const transactionDate = new Date(transaction.date)
    const transactionDateMs = transactionDate.getTime()
    if (!Number.isFinite(transactionDateMs)) {
      return
    }

    entries.push({
      transaction,
      transactionDate,
      transactionDateMs,
      dayKey: transactionDate.toISOString().slice(0, 10),
      monthKey: `${transactionDate.getFullYear()}-${String(
        transactionDate.getMonth() + 1
      ).padStart(2, '0')}`,
    })
  })

  return entries
}

const buildCashFlowPlanningSnapshot = ({
  liquidCashBalance,
  subscriptions,
  transactionDateEntries,
}: {
  liquidCashBalance: number
  subscriptions: IDashboardWorkerRequest['payload']['subscriptions']
  transactionDateEntries: ITransactionDateEntry[]
}): ICashFlowPlanningSnapshot => {
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const horizonDays = 30
  const day14 = new Date(startOfToday)
  day14.setDate(day14.getDate() + 14)
  const horizonEnd = new Date(startOfToday)
  horizonEnd.setDate(horizonEnd.getDate() + horizonDays)
  const millisecondsPerDay = 24 * 60 * 60 * 1000

  const events: ICashFlowEvent[] = []

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
      amounts: number[]
      dates: Date[]
      description: string
      isRecurring: boolean
      type: 'INCOME' | 'EXPENSE'
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
    if (averageAmount <= 0 || (maxAmount - minAmount) / averageAmount > 0.45) {
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

  const dailyBuckets = new Map<string, { expenses: number; income: number }>()
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
}

const buildSpendingData = ({
  categoryById,
  transactionDateEntries,
}: {
  categoryById: Map<string, string>
  transactionDateEntries: ITransactionDateEntry[]
}) => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const categoryTotals = new Map<string, number>()
  let monthTotalSpent = 0

  transactionDateEntries.forEach(({ transaction, transactionDate }) => {
    if (
      transaction.type !== 'EXPENSE' ||
      transactionDate.getMonth() !== currentMonth ||
      transactionDate.getFullYear() !== currentYear
    ) {
      return
    }

    const categoryName =
      transaction.categoryRelationName ||
      categoryById.get(transaction.categoryId ?? '') ||
      transaction.category ||
      'Other'
    const absoluteAmount = Math.abs(transaction.amount)
    monthTotalSpent += absoluteAmount
    categoryTotals.set(
      categoryName,
      (categoryTotals.get(categoryName) ?? 0) + absoluteAmount
    )
  })

  return Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: monthTotalSpent > 0 ? (amount / monthTotalSpent) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

const buildExpenseTotalsByDay = (
  transactionDateEntries: ITransactionDateEntry[]
) => {
  const totals: Record<string, number> = {}

  transactionDateEntries.forEach(({ dayKey, transaction }) => {
    if (transaction.type !== 'EXPENSE') {
      return
    }
    totals[dayKey] = (totals[dayKey] ?? 0) + Math.abs(transaction.amount)
  })

  return totals
}

const buildDataQualitySnapshot = ({
  accounts,
  categoryById,
  transactionDateEntries,
  transactions,
}: {
  accounts: IDashboardWorkerRequest['payload']['accounts']
  categoryById: Map<string, string>
  transactionDateEntries: ITransactionDateEntry[]
  transactions: IWorkerTransaction[]
}) => {
  const uncategorizedCount = transactions.filter((transaction) => {
    const categoryName =
      transaction.categoryRelationName ||
      categoryById.get(transaction.categoryId ?? '') ||
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
    duplicateBuckets.set(bucketKey, (duplicateBuckets.get(bucketKey) ?? 0) + 1)
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
}

const buildWorkerAnalytics = (
  payload: IDashboardWorkerRequest['payload']
): IDashboardWorkerResultPayload => {
  const categoryById = new Map(
    payload.categories.map((category) => [category.id, category.name])
  )
  const transactionDateEntries = createTransactionDateEntries(
    payload.transactions
  )

  return {
    cashFlowPlanningSnapshot: buildCashFlowPlanningSnapshot({
      liquidCashBalance: payload.liquidCashBalance,
      subscriptions: payload.subscriptions,
      transactionDateEntries,
    }),
    spendingData: buildSpendingData({
      categoryById,
      transactionDateEntries,
    }),
    expenseTotalsByDay: buildExpenseTotalsByDay(transactionDateEntries),
    dataQualitySnapshot: buildDataQualitySnapshot({
      accounts: payload.accounts,
      categoryById,
      transactionDateEntries,
      transactions: payload.transactions,
    }),
  }
}

self.onmessage = (event: MessageEvent<IDashboardWorkerRequest>) => {
  const resultPayload = buildWorkerAnalytics(event.data.payload)
  self.postMessage({
    requestId: event.data.requestId,
    payload: resultPayload,
  })
}

export {}
