'use client'

import { useEffect, useRef } from 'react'
import {
  notificationThresholds,
  useNotifications,
} from '@/components/notification-system'
import {
  useAccounts,
  useTransactions,
  useBudgets,
  useGoals,
  useSubscriptions,
  useCreditCardUtilization,
} from '@/hooks/use-finance-data'
import { useBillingStatus } from '@/hooks/use-billing-status'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { analyzeCreditCardPerks } from '@/lib/credit-card-perks'
import { formatCurrency } from '@/lib/utils'

/** Background notification triggers for high-signal finance events. */
const NotificationTriggers = () => {
  const { addNotification, isAlertRuleEnabled } = useNotifications()
  const { isDemoMode } = useDemoMode()
  const { data: billingData } = useBillingStatus()
  const { data: accounts = [] } = useAccounts()
  const { data: transactions = [] } = useTransactions()
  const { data: budgets = [] } = useBudgets()
  const { data: goals = [] } = useGoals()
  const { data: subscriptions = [] } = useSubscriptions()
  const { utilization: creditCardUtilization } = useCreditCardUtilization()
  const previousSubscriptionIds = useRef<string[]>([])
  const previousGoalIds = useRef<string[]>([])
  const hasProPerkAccess = isDemoMode || billingData?.currentPlan === 'PRO'

  useEffect(() => {
    if (accounts.length === 0) return
    if (!isAlertRuleEnabled('low-balance')) return

    const liquidBalance = accounts
      .filter(
        (account) => account.type === 'CHECKING' || account.type === 'SAVINGS'
      )
      .reduce((total, account) => total + account.balance, 0)
    const monthKey = new Date().toISOString().slice(0, 7)

    if (
      liquidBalance > 0 &&
      liquidBalance <= notificationThresholds.lowBalance
    ) {
      addNotification({
        type: 'warning',
        title: 'Low cash balance',
        message: `Your cash balance is ${formatCurrency(
          liquidBalance
        )}. Consider moving funds or adjusting spend.`,
        category: 'system',
        ruleId: 'low-balance',
        showToast: true,
        dedupeKey: `low-balance-${monthKey}`,
        throttleMinutes: 720,
      })
    }
  }, [accounts, addNotification, isAlertRuleEnabled])

  useEffect(() => {
    if (!isAlertRuleEnabled('credit-utilization')) return
    if (creditCardUtilization <= notificationThresholds.utilizationWarning) {
      return
    }

    const monthKey = new Date().toISOString().slice(0, 7)
    addNotification({
      type: 'warning',
      title: 'Credit utilization elevated',
      message: `You are using ${creditCardUtilization.toFixed(
        1
      )}% of your credit limit. Consider a payoff or balance transfer.`,
      category: 'budget',
      ruleId: 'credit-utilization',
      showToast: true,
      dedupeKey: `utilization-${monthKey}`,
      throttleMinutes: 720,
    })
  }, [creditCardUtilization, addNotification, isAlertRuleEnabled])

  useEffect(() => {
    if (budgets.length === 0 || transactions.length === 0) return
    const budgetWarningEnabled = isAlertRuleEnabled('budget-warning')
    const budgetOverEnabled = isAlertRuleEnabled('budget-over')
    if (!budgetWarningEnabled && !budgetOverEnabled) return

    const currentDate = new Date()
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    )
    const monthKey = currentDate.toISOString().slice(0, 7)

    budgets.forEach((budget) => {
      if (!budget.amount) return
      const startDate = new Date(budget.startDate)
      const endDate = budget.endDate ? new Date(budget.endDate) : endOfMonth
      const budgetCategoryName =
        typeof budget.category === 'string'
          ? budget.category
          : budget.category?.name
      const spent = transactions
        .filter((transaction) => {
          if (transaction.type !== 'EXPENSE') return false
          const transactionDate = new Date(transaction.date)
          const categoryMatch =
            (budget.categoryId &&
              transaction.categoryId === budget.categoryId) ||
            (budgetCategoryName && transaction.category === budgetCategoryName)
          return (
            categoryMatch &&
            transactionDate >= startDate &&
            transactionDate <= endDate
          )
        })
        .reduce((total, transaction) => total + Math.abs(transaction.amount), 0)

      const percent = spent / budget.amount
      if (percent >= notificationThresholds.budgetOverRatio) {
        if (!budgetOverEnabled) {
          return
        }
        addNotification({
          type: 'error',
          title: 'Budget exceeded',
          message: `${budget.name} is over budget at ${formatCurrency(
            spent
          )} spent.`,
          category: 'budget',
          ruleId: 'budget-over',
          showToast: true,
          dedupeKey: `budget-over-${budget.id}-${monthKey}`,
          throttleMinutes: 720,
        })
        return
      }

      if (percent >= notificationThresholds.budgetWarningRatio) {
        if (!budgetWarningEnabled) {
          return
        }
        addNotification({
          type: 'warning',
          title: 'Budget nearing limit',
          message: `${budget.name} is ${Math.round(percent * 100)}% used.`,
          category: 'budget',
          ruleId: 'budget-warning',
          showToast: false,
          dedupeKey: `budget-warning-${budget.id}-${monthKey}`,
          throttleMinutes: 720,
        })
      }
    })
  }, [budgets, transactions, addNotification, isAlertRuleEnabled])

  useEffect(() => {
    if (transactions.length === 0) return
    if (!isAlertRuleEnabled('spending-spike')) return

    const currentDate = new Date()
    const dayInMilliseconds = 24 * 60 * 60 * 1000
    const recentStart = new Date(currentDate.getTime() - dayInMilliseconds * 7)
    const previousStart = new Date(
      currentDate.getTime() - dayInMilliseconds * 14
    )

    const recentTotal = transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return (
          transaction.type === 'EXPENSE' &&
          transactionDate >= recentStart &&
          transactionDate <= currentDate
        )
      })
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

    const previousTotal = transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return (
          transaction.type === 'EXPENSE' &&
          transactionDate >= previousStart &&
          transactionDate < recentStart
        )
      })
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)

    if (
      previousTotal > 0 &&
      recentTotal >
        previousTotal * (1 + notificationThresholds.spendingSpikeRatio) &&
      recentTotal - previousTotal >= notificationThresholds.spendingSpikeMinimum
    ) {
      addNotification({
        type: 'warning',
        title: 'Spending spike detected',
        message: `Last 7 days spending hit ${formatCurrency(
          recentTotal
        )}, up from ${formatCurrency(previousTotal)}.`,
        category: 'transaction',
        ruleId: 'spending-spike',
        showToast: true,
        dedupeKey: `spending-spike-${recentStart.toISOString().slice(0, 10)}`,
        throttleMinutes: 1440,
      })
    }
  }, [transactions, addNotification, isAlertRuleEnabled])

  useEffect(() => {
    if (!hasProPerkAccess) return
    if (!isAlertRuleEnabled('card-perk-expiry')) return

    const perkInsight = analyzeCreditCardPerks({
      accounts,
      transactions,
      expiryWarningDays: notificationThresholds.perkExpiryLookaheadDays,
    })

    perkInsight.cards.forEach((card) => {
      card.perks.forEach((perk) => {
        if (!perk.isExpiringSoon || perk.remainingAmount <= 0) return
        const monthKey = perk.cycleStartDate.toISOString().slice(0, 7)
        addNotification({
          type: 'info',
          title: 'Card perk expiring soon',
          message: `${perk.name} on ${
            card.cardName
          } has ${formatCurrency(perk.remainingAmount)} unused with ${
            perk.daysRemainingInCycle
          } day${perk.daysRemainingInCycle === 1 ? '' : 's'} left.`,
          category: 'system',
          ruleId: 'card-perk-expiry',
          showToast: false,
          dedupeKey: `card-perk-expiry-${card.cardId}-${perk.id}-${monthKey}`,
          throttleMinutes: 1440,
        })
      })
    })
  }, [
    accounts,
    addNotification,
    hasProPerkAccess,
    isAlertRuleEnabled,
    transactions,
  ])

  useEffect(() => {
    if (transactions.length === 0) return
    if (!isAlertRuleEnabled('large-transaction')) return

    const currentDate = new Date()
    const dayInMilliseconds = 24 * 60 * 60 * 1000
    const recentStart = new Date(currentDate.getTime() - dayInMilliseconds * 7)
    const lookbackStart = new Date(
      currentDate.getTime() - dayInMilliseconds * 30
    )
    const recentExpenses = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return (
        transaction.type === 'EXPENSE' &&
        transactionDate >= lookbackStart &&
        transactionDate <= currentDate
      )
    })

    const averageExpense =
      recentExpenses.length > 0
        ? recentExpenses.reduce(
            (sum, transaction) => sum + Math.abs(transaction.amount),
            0
          ) / recentExpenses.length
        : 0
    const largeTransactionThreshold = Math.max(
      notificationThresholds.largeTransactionMinimum,
      averageExpense * notificationThresholds.largeTransactionMultiplier
    )

    const largeTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date)
      return (
        transaction.type === 'EXPENSE' &&
        transactionDate >= recentStart &&
        transactionDate <= currentDate &&
        Math.abs(transaction.amount) >= largeTransactionThreshold
      )
    })

    largeTransactions.forEach((transaction) => {
      addNotification({
        type: 'info',
        title: 'Large transaction',
        message: `${transaction.description} for ${formatCurrency(
          Math.abs(transaction.amount)
        )} on ${new Date(transaction.date).toLocaleDateString()}.`,
        category: 'transaction',
        ruleId: 'large-transaction',
        showToast: true,
        dedupeKey: `large-transaction-${transaction.id}`,
        throttleMinutes: 1440,
      })
    })
  }, [transactions, addNotification, isAlertRuleEnabled])

  useEffect(() => {
    if (subscriptions.length === 0) return
    if (!isAlertRuleEnabled('subscription-due')) return

    const currentDate = new Date()
    const dayInMilliseconds = 24 * 60 * 60 * 1000

    subscriptions.forEach((subscription) => {
      const billingDate = new Date(subscription.nextBillingDate)
      const daysUntil = Math.ceil(
        (billingDate.getTime() - currentDate.getTime()) / dayInMilliseconds
      )
      if (
        daysUntil >= 0 &&
        daysUntil <= notificationThresholds.subscriptionLookaheadDays
      ) {
        addNotification({
          type: 'info',
          title: 'Subscription due soon',
          message: `${subscription.name} renews in ${daysUntil} day${
            daysUntil === 1 ? '' : 's'
          }.`,
          category: 'system',
          ruleId: 'subscription-due',
          showToast: false,
          dedupeKey: `subscription-due-${subscription.id}-${billingDate
            .toISOString()
            .slice(0, 10)}`,
          throttleMinutes: 1440,
        })
      }
    })
  }, [subscriptions, addNotification, isAlertRuleEnabled])

  useEffect(() => {
    if (subscriptions.length === 0) return
    if (!isAlertRuleEnabled('subscription-new')) return

    if (previousSubscriptionIds.current.length === 0) {
      previousSubscriptionIds.current = subscriptions.map(
        (subscription) => subscription.id
      )
      return
    }

    const previousIds = new Set(previousSubscriptionIds.current)
    const newSubscriptions = subscriptions.filter(
      (subscription) => !previousIds.has(subscription.id)
    )

    newSubscriptions.forEach((subscription) => {
      addNotification({
        type: 'success',
        title: 'New subscription added',
        message: `${subscription.name} was added at ${formatCurrency(
          subscription.amount
        )} per cycle.`,
        category: 'system',
        ruleId: 'subscription-new',
        showToast: true,
        dedupeKey: `subscription-new-${subscription.id}`,
        throttleMinutes: 1440,
      })
    })

    previousSubscriptionIds.current = subscriptions.map(
      (subscription) => subscription.id
    )
  }, [subscriptions, addNotification, isAlertRuleEnabled])

  useEffect(() => {
    if (goals.length === 0) return
    const deadlineEnabled = isAlertRuleEnabled('goal-deadline')
    const completeEnabled = isAlertRuleEnabled('goal-complete')
    if (!deadlineEnabled && !completeEnabled) return

    const currentDate = new Date()
    goals.forEach((goal) => {
      if (!goal.targetDate || goal.targetAmount <= 0) return
      const targetDate = new Date(goal.targetDate)
      const daysUntil = Math.ceil(
        (targetDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)
      )
      const progress = goal.currentAmount / goal.targetAmount

      if (
        deadlineEnabled &&
        daysUntil >= 0 &&
        daysUntil <= notificationThresholds.goalDeadlineDays &&
        progress < notificationThresholds.goalProgressWarning
      ) {
        addNotification({
          type: 'warning',
          title: 'Goal deadline approaching',
          message: `${goal.name} is ${Math.round(
            progress * 100
          )}% funded with ${daysUntil} days to go.`,
          category: 'goal',
          ruleId: 'goal-deadline',
          showToast: false,
          dedupeKey: `goal-deadline-${goal.id}-${targetDate
            .toISOString()
            .slice(0, 10)}`,
          throttleMinutes: 1440,
        })
      }

      if (completeEnabled && progress >= 1 && !goal.isCompleted) {
        addNotification({
          type: 'success',
          title: 'Goal achieved',
          message: `${goal.name} has reached ${formatCurrency(
            goal.currentAmount
          )}.`,
          category: 'goal',
          ruleId: 'goal-complete',
          showToast: true,
          dedupeKey: `goal-complete-${goal.id}`,
          throttleMinutes: 1440,
        })
      }
    })
  }, [goals, addNotification, isAlertRuleEnabled])

  useEffect(() => {
    if (goals.length === 0) return
    if (!isAlertRuleEnabled('goal-new')) return

    if (previousGoalIds.current.length === 0) {
      previousGoalIds.current = goals.map((goal) => goal.id)
      return
    }

    const previousIds = new Set(previousGoalIds.current)
    const newGoals = goals.filter((goal) => !previousIds.has(goal.id))

    newGoals.forEach((goal) => {
      addNotification({
        type: 'success',
        title: 'New goal added',
        message: `${goal.name} is set for ${formatCurrency(
          goal.targetAmount
        )}.`,
        category: 'goal',
        ruleId: 'goal-new',
        showToast: true,
        dedupeKey: `goal-new-${goal.id}`,
        throttleMinutes: 1440,
      })
    })

    previousGoalIds.current = goals.map((goal) => goal.id)
  }, [goals, addNotification, isAlertRuleEnabled])

  useEffect(() => {
    if (transactions.length === 0) return
    if (!isAlertRuleEnabled('income-drop')) return

    const currentDate = new Date()
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    )
    const previousMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    )
    const previousMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    )

    const currentIncome = transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return (
          transaction.type === 'INCOME' &&
          transactionDate >= currentMonthStart &&
          transactionDate <= currentDate
        )
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    const previousIncome = transactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        return (
          transaction.type === 'INCOME' &&
          transactionDate >= previousMonthStart &&
          transactionDate <= previousMonthEnd
        )
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0)

    if (
      previousIncome > 0 &&
      currentIncome < previousIncome * notificationThresholds.incomeDropRatio
    ) {
      addNotification({
        type: 'warning',
        title: 'Income trending down',
        message: `Income this month is ${formatCurrency(
          currentIncome
        )} vs ${formatCurrency(previousIncome)} last month.`,
        category: 'system',
        ruleId: 'income-drop',
        showToast: false,
        dedupeKey: `income-drop-${currentMonthStart.toISOString().slice(0, 7)}`,
        throttleMinutes: 1440,
      })
    }
  }, [transactions, addNotification, isAlertRuleEnabled])

  return null
}

export default NotificationTriggers
