export type TBudgetForecastPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
export type TBudgetForecastStatus = 'healthy' | 'warning' | 'over'

export interface IBudgetForecastBudget {
  id: string
  name: string
  amount: number
  period?: TBudgetForecastPeriod
  categoryId?: string | null
  startDate?: Date | string | null
  endDate?: Date | string | null
  isRecurring?: boolean
  category?: { name?: string | null } | string | null
}

export interface IBudgetForecastTransaction {
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | string
  amount: number
  date: Date | string
  categoryId?: string | null
  category?: string | null
  categoryRelation?: { name?: string | null } | null
}

export interface IBudgetForecastItem {
  id: string
  name: string
  period: TBudgetForecastPeriod
  categoryName?: string
  amount: number
  spentToDate: number
  projectedSpend: number
  remainingAmount: number
  projectedUtilization: number
  currentUtilization: number
  status: TBudgetForecastStatus
  daysUntilOverBudget: number | null
  daysRemainingInWindow: number
  recommendedDailyCap: number
  likelyOverrunDate: Date | null
}

export interface IBudgetForecastCalculationInput {
  budgets: IBudgetForecastBudget[]
  transactions: IBudgetForecastTransaction[]
  categoryLookup?: Map<string, string>
  now?: Date
  limit?: number
}

const millisecondsPerDay = 24 * 60 * 60 * 1000

function parseDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  const parsed = value instanceof Date ? new Date(value) : new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

function getStartOfDay(date: Date): Date {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  return start
}

function getEndOfDay(date: Date): Date {
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return end
}

function getCalendarWindow(period: TBudgetForecastPeriod, referenceDate: Date) {
  if (period === 'WEEKLY') {
    const start = new Date(referenceDate)
    start.setDate(start.getDate() - start.getDay())
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { windowStart: start, windowEnd: end }
  }

  if (period === 'YEARLY') {
    const start = new Date(referenceDate.getFullYear(), 0, 1)
    const end = new Date(referenceDate.getFullYear(), 11, 31, 23, 59, 59, 999)
    return { windowStart: start, windowEnd: end }
  }

  if (period === 'DAILY') {
    const end = getEndOfDay(referenceDate)
    return { windowStart: referenceDate, windowEnd: end }
  }

  const start = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    1
  )
  const end = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  )
  return { windowStart: start, windowEnd: end }
}

function getNonRecurringWindow(period: TBudgetForecastPeriod, startDate: Date) {
  if (period === 'WEEKLY') {
    const end = new Date(startDate)
    end.setDate(end.getDate() + 6)
    return { windowStart: startDate, windowEnd: getEndOfDay(end) }
  }

  if (period === 'YEARLY') {
    const end = new Date(startDate.getFullYear(), 11, 31)
    return { windowStart: startDate, windowEnd: getEndOfDay(end) }
  }

  if (period === 'DAILY') {
    return { windowStart: startDate, windowEnd: getEndOfDay(startDate) }
  }

  const end = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
  return { windowStart: startDate, windowEnd: getEndOfDay(end) }
}

function getBudgetWindow(budget: IBudgetForecastBudget, startOfToday: Date) {
  const period = budget.period ?? 'MONTHLY'
  const calendarWindow = getCalendarWindow(period, startOfToday)
  const budgetStartDate = parseDate(budget.startDate)
  const budgetEndDate = parseDate(budget.endDate)

  if (!budget.isRecurring && budgetStartDate) {
    const normalizedStartDate = getStartOfDay(budgetStartDate)
    const fallbackWindow = getNonRecurringWindow(period, normalizedStartDate)
    const explicitEndDate = budgetEndDate ? getEndOfDay(budgetEndDate) : null
    const windowEnd = explicitEndDate ?? fallbackWindow.windowEnd
    if (windowEnd.getTime() < normalizedStartDate.getTime()) {
      return {
        windowStart: normalizedStartDate,
        windowEnd: getEndOfDay(normalizedStartDate),
      }
    }
    return { windowStart: normalizedStartDate, windowEnd }
  }

  let windowStart = calendarWindow.windowStart
  let windowEnd = calendarWindow.windowEnd

  if (budgetStartDate) {
    const normalizedStartDate = getStartOfDay(budgetStartDate)
    if (normalizedStartDate.getTime() > windowStart.getTime()) {
      windowStart = normalizedStartDate
    }
  }

  if (budgetEndDate) {
    const normalizedEndDate = getEndOfDay(budgetEndDate)
    if (normalizedEndDate.getTime() < windowEnd.getTime()) {
      windowEnd = normalizedEndDate
    }
  }

  if (windowEnd.getTime() < windowStart.getTime()) {
    windowEnd = getEndOfDay(windowStart)
  }

  return { windowStart, windowEnd }
}

function getStatusRank(status: TBudgetForecastStatus) {
  if (status === 'over') return 3
  if (status === 'warning') return 2
  return 1
}

export function calculateBudgetForecastItems({
  budgets,
  transactions,
  categoryLookup = new Map<string, string>(),
  now = new Date(),
  limit,
}: IBudgetForecastCalculationInput): IBudgetForecastItem[] {
  const startOfToday = getStartOfDay(now)
  const endOfToday = getEndOfDay(startOfToday)

  const transactionDateEntries = transactions
    .map((transaction) => {
      const transactionDate = parseDate(transaction.date)
      if (!transactionDate) return null
      return { transaction, transactionDate }
    })
    .filter(
      (
        entry
      ): entry is {
        transaction: IBudgetForecastTransaction
        transactionDate: Date
      } => entry !== null
    )

  const items = budgets
    .map((budget) => {
      const period = budget.period ?? 'MONTHLY'
      const categoryName =
        typeof budget.category === 'string'
          ? budget.category
          : budget.category?.name || undefined

      const { windowStart, windowEnd } = getBudgetWindow(budget, startOfToday)
      const effectiveEndTime = Math.min(
        endOfToday.getTime(),
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
        transaction: IBudgetForecastTransaction
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
        .reduce((sum, { transaction }) => sum + Math.abs(transaction.amount), 0)

      const projectedSpend = (spentToDate / daysElapsed) * daysInWindow
      const remainingAmount = budget.amount - spentToDate
      const averageDailySpend = spentToDate / daysElapsed
      const projectedUtilization =
        budget.amount > 0 ? (projectedSpend / budget.amount) * 100 : 0
      const currentUtilization =
        budget.amount > 0 ? (spentToDate / budget.amount) * 100 : 0

      let status: TBudgetForecastStatus = 'healthy'
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
        period,
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

  if (typeof limit === 'number') {
    return items.slice(0, Math.max(0, limit))
  }

  return items
}
