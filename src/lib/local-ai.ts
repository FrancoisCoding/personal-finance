// local-ai.ts - Hosted AI implementation using OpenRouter

interface AIMessage {
  role: 'system' | 'user'
  content: string
}

export interface ChatTransaction {
  description?: string
  amount?: number
  category?: string
  type?: string
  date?: string | Date
  accountId?: string
  accountName?: string
  accountType?: string
}

export interface ChatAccount {
  id?: string
  name?: string
  type?: string
  balance?: number
  creditLimit?: number
}

export interface ChatSubscription {
  name?: string
  amount?: number
  billingCycle?: string
  nextBillingDate?: string
}

export interface ChatContext {
  transactions?: ChatTransaction[]
  accounts?: ChatAccount[]
  subscriptions?: ChatSubscription[]
  generatedAt?: string
}

export interface CategorizationResult {
  category: string
  confidence: number
  tags: string[]
}

export interface FinancialInsight {
  type:
    | 'spending_pattern'
    | 'budget_alert'
    | 'savings_opportunity'
    | 'subscription_review'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  actionable: boolean
  action?: string
}

const sanitizeEnvValue = (value?: string) =>
  value ? value.replace(/^['"]|['"]$/g, '').trim() : ''

// OpenRouter configuration
const OPENROUTER_API_KEY = sanitizeEnvValue(process.env.OPENROUTER_API_KEY)
const OPENROUTER_BASE_URL =
  sanitizeEnvValue(process.env.OPENROUTER_BASE_URL) ||
  'https://openrouter.ai/api/v1'
const OPENROUTER_MODEL = sanitizeEnvValue(process.env.OPENROUTER_MODEL)
const OPENROUTER_SITE_URL = sanitizeEnvValue(process.env.OPENROUTER_SITE_URL)
const OPENROUTER_SITE_NAME = sanitizeEnvValue(process.env.OPENROUTER_SITE_NAME)

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)

const formatShortDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

const parseDate = (value?: string | Date) => {
  if (!value) return null
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

const getMonthlyEquivalent = (amount: number, billingCycle?: string) => {
  switch (billingCycle) {
    case 'WEEKLY':
      return amount * 4.33
    case 'QUARTERLY':
      return amount / 3
    case 'YEARLY':
      return amount / 12
    default:
      return amount
  }
}

const buildSpendingSnapshot = (
  transactions: ChatTransaction[],
  accounts: ChatAccount[],
  windowDays: number
) => {
  const now = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - windowDays)
  const accountTypes = new Map(
    accounts
      .filter((account) => account.id)
      .map((account) => [String(account.id), account.type])
  )

  const recentExpenses = transactions.filter((transaction) => {
    const date = parseDate(transaction.date)
    if (!date) return false
    if (date < startDate || date > now) return false
    return transaction.type === 'EXPENSE'
  })

  const categoryTotals = new Map<string, number>()
  let totalSpending = 0
  let creditCardSpending = 0
  let otherSpending = 0
  let creditCardCount = 0
  let otherCount = 0

  recentExpenses.forEach((transaction) => {
    const amount = Math.abs(transaction.amount ?? 0)
    totalSpending += amount

    const categoryName = transaction.category || 'Uncategorized'
    categoryTotals.set(
      categoryName,
      (categoryTotals.get(categoryName) ?? 0) + amount
    )

    const accountType =
      transaction.accountType ||
      (transaction.accountId
        ? accountTypes.get(String(transaction.accountId))
        : undefined)

    if (accountType === 'CREDIT_CARD') {
      creditCardSpending += amount
      creditCardCount += 1
    } else {
      otherSpending += amount
      otherCount += 1
    }
  })

  const topCategories = Array.from(categoryTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, total]) => ({ name, total }))

  return {
    windowDays,
    startDate,
    endDate: now,
    totalSpending,
    transactionCount: recentExpenses.length,
    creditCardSpending,
    creditCardCount,
    otherSpending,
    otherCount,
    topCategories,
  }
}

const buildCashSnapshot = (accounts: ChatAccount[]) => {
  const checkingSavings = accounts.filter(
    (account) => account.type === 'CHECKING' || account.type === 'SAVINGS'
  )
  const totalCash = checkingSavings.reduce(
    (sum, account) => sum + (account.balance ?? 0),
    0
  )

  return {
    totalCash,
    accountCount: checkingSavings.length,
  }
}

const buildSubscriptionSnapshot = (subscriptions: ChatSubscription[]) => {
  const monthlyTotal = subscriptions.reduce(
    (sum, subscription) =>
      sum +
      getMonthlyEquivalent(subscription.amount ?? 0, subscription.billingCycle),
    0
  )

  const upcoming = subscriptions
    .map((subscription) => ({
      name: subscription.name ?? 'Subscription',
      amount: subscription.amount ?? 0,
      billingCycle: subscription.billingCycle ?? 'MONTHLY',
      nextBillingDate: parseDate(subscription.nextBillingDate),
    }))
    .filter((subscription) => subscription.nextBillingDate)
    .sort(
      (a, b) =>
        (a.nextBillingDate?.getTime() ?? 0) -
        (b.nextBillingDate?.getTime() ?? 0)
    )
    .slice(0, 3)

  return {
    monthlyTotal,
    upcoming,
  }
}

const buildCashFlowSnapshot = (
  transactions: ChatTransaction[],
  windowDays: number
) => {
  const now = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - windowDays)

  let incomeTotal = 0
  let expenseTotal = 0
  let incomeCount = 0
  let expenseCount = 0

  transactions.forEach((transaction) => {
    const date = parseDate(transaction.date)
    if (!date || date < startDate || date > now) return
    const amount = transaction.amount ?? 0
    if (transaction.type === 'INCOME') {
      incomeTotal += amount
      incomeCount += 1
    } else if (transaction.type === 'EXPENSE') {
      expenseTotal += Math.abs(amount)
      expenseCount += 1
    }
  })

  return {
    windowDays,
    startDate,
    endDate: now,
    incomeTotal,
    expenseTotal,
    incomeCount,
    expenseCount,
    netCashFlow: incomeTotal - expenseTotal,
  }
}

const buildNetWorthSnapshot = (accounts: ChatAccount[]) => {
  const assetTypes = new Set(['CHECKING', 'SAVINGS', 'INVESTMENT', 'OTHER'])
  const liabilityTypes = new Set(['CREDIT_CARD', 'LOAN', 'MORTGAGE'])

  let assets = 0
  let liabilities = 0

  accounts.forEach((account) => {
    const balance = account.balance ?? 0
    if (account.type && liabilityTypes.has(account.type)) {
      liabilities += Math.abs(balance)
      return
    }
    if (!account.type || assetTypes.has(account.type)) {
      assets += balance
    }
  })

  return {
    assets,
    liabilities,
    netWorth: assets - liabilities,
  }
}

const buildLargestExpenseSnapshot = (
  transactions: ChatTransaction[],
  windowDays: number,
  minimumAmount?: number
) => {
  const now = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - windowDays)
  const threshold = minimumAmount ?? 0

  const expenses = transactions
    .map((transaction) => {
      const date = parseDate(transaction.date)
      if (!date || date < startDate || date > now) return null
      if (transaction.type !== 'EXPENSE') return null
      const amount = Math.abs(transaction.amount ?? 0)
      if (amount < threshold) return null
      return {
        description: transaction.description ?? 'Expense',
        amount,
        date,
      }
    })
    .filter(
      (
        transaction
      ): transaction is { description: string; amount: number; date: Date } =>
        Boolean(transaction)
    )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)

  return {
    expenses,
    startDate,
    endDate: now,
  }
}

const buildSpendingSpikeSnapshot = (transactions: ChatTransaction[]) => {
  const now = new Date()
  const dayMs = 24 * 60 * 60 * 1000
  const recentStart = new Date(now.getTime() - dayMs * 7)
  const previousStart = new Date(now.getTime() - dayMs * 14)

  const recentTotal = transactions
    .filter((transaction) => {
      const date = parseDate(transaction.date)
      if (!date || date < recentStart || date > now) return false
      return transaction.type === 'EXPENSE'
    })
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount ?? 0), 0)

  const previousTotal = transactions
    .filter((transaction) => {
      const date = parseDate(transaction.date)
      if (!date || date < previousStart || date >= recentStart) return false
      return transaction.type === 'EXPENSE'
    })
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount ?? 0), 0)

  const percentChange =
    previousTotal > 0 ? (recentTotal - previousTotal) / previousTotal : 0

  return {
    recentTotal,
    previousTotal,
    percentChange,
  }
}

const buildDonationSnapshot = (
  transactions: ChatTransaction[],
  windowDays: number
) => {
  const keywords = ['donation', 'charity', 'church', 'tithe', 'giving']
  const now = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - windowDays)

  const donations = transactions.filter((transaction) => {
    const date = parseDate(transaction.date)
    if (!date || date < startDate || date > now) return false
    if (transaction.type !== 'EXPENSE') return false
    const description = transaction.description?.toLowerCase() ?? ''
    const category = transaction.category?.toLowerCase() ?? ''
    return keywords.some(
      (keyword) => description.includes(keyword) || category.includes(keyword)
    )
  })

  const total = donations.reduce(
    (sum, transaction) => sum + Math.abs(transaction.amount ?? 0),
    0
  )

  return {
    total,
    count: donations.length,
  }
}

const buildCreditUtilizationSnapshot = (accounts: ChatAccount[]) => {
  const creditAccounts = accounts.filter(
    (account) => account.type === 'CREDIT_CARD' && account.creditLimit
  )

  const totalLimit = creditAccounts.reduce(
    (sum, account) => sum + (account.creditLimit ?? 0),
    0
  )
  const totalBalance = creditAccounts.reduce(
    (sum, account) => sum + Math.abs(account.balance ?? 0),
    0
  )

  return {
    totalLimit,
    totalBalance,
    utilization: totalLimit > 0 ? (totalBalance / totalLimit) * 100 : undefined,
    accountCount: creditAccounts.length,
  }
}

const parseAmountThreshold = (message: string) => {
  const match = message.match(/\$?(\d{2,6}(?:\.\d{1,2})?)/)
  if (!match) return null
  const value = Number(match[1])
  if (Number.isNaN(value)) return null
  return value
}

const buildSnapshotTail = (context: ChatContext) => {
  const transactions = context.transactions ?? []
  const accounts = context.accounts ?? []
  const subscriptions = context.subscriptions ?? []

  if (transactions.length === 0 && accounts.length === 0) {
    return ''
  }

  const spendingSnapshot = buildSpendingSnapshot(transactions, accounts, 30)
  const cashFlowSnapshot = buildCashFlowSnapshot(transactions, 30)
  const cashSnapshot = buildCashSnapshot(accounts)
  const subscriptionSnapshot = buildSubscriptionSnapshot(subscriptions)

  const lines = [
    'Quick data snapshot:',
    `30-day spending: ${formatCurrency(spendingSnapshot.totalSpending)}.`,
    cashFlowSnapshot.incomeTotal > 0 || cashFlowSnapshot.expenseTotal > 0
      ? `Net cash flow: ${formatCurrency(cashFlowSnapshot.netCashFlow)}.`
      : null,
    `Cash on hand: ${formatCurrency(cashSnapshot.totalCash)}.`,
    `Subscriptions (monthly): ${formatCurrency(
      subscriptionSnapshot.monthlyTotal
    )}.`,
    spendingSnapshot.topCategories[0]
      ? `Top category: ${spendingSnapshot.topCategories[0].name} (${formatCurrency(
          spendingSnapshot.topCategories[0].total
        )}).`
      : null,
  ]

  return lines.filter(Boolean).join('\n')
}

const buildFallbackSummary = (context: ChatContext) => {
  const summary = buildSnapshotTail(context)
  if (!summary) {
    return (
      'I do not have enough recent data to answer that yet. ' +
      'Connect accounts or add transactions to get a real-time summary.'
    )
  }
  return summary
}

const buildDeterministicAnswer = (message: string, context: ChatContext) => {
  const lower = message.toLowerCase()
  const transactions = context.transactions ?? []
  const accounts = context.accounts ?? []
  const subscriptions = context.subscriptions ?? []

  const spendingSnapshot = buildSpendingSnapshot(transactions, accounts, 30)
  const cashFlowSnapshot = buildCashFlowSnapshot(transactions, 30)
  const cashSnapshot = buildCashSnapshot(accounts)
  const subscriptionSnapshot = buildSubscriptionSnapshot(subscriptions)
  const netWorthSnapshot = buildNetWorthSnapshot(accounts)
  const spikeSnapshot = buildSpendingSpikeSnapshot(transactions)
  const donationSnapshot = buildDonationSnapshot(transactions, 30)
  const creditUtilizationSnapshot = buildCreditUtilizationSnapshot(accounts)
  const amountThreshold = parseAmountThreshold(message)

  const asksSpending = /spend|spending|spent|outflow|expense/.test(lower)
  const asksMonthly =
    /per month|monthly|this month|last 30 days|past 30 days/.test(lower)
  const mentionsCreditCard = /credit card|creditcard|card/.test(lower)
  const asksTopCategories = /top (three|3)? .*categories|top categories/.test(
    lower
  )
  const asksCash = /cash|checking|savings/.test(lower)
  const asksSubscriptions = /subscription|recurring/.test(lower)
  const asksNetWorth = /net worth|networth|assets|liabilities/.test(lower)
  const asksCashFlow =
    /cash flow|net cash|netflow|income vs|income and expenses/.test(lower)
  const asksIncome = /income|salary|payroll|earnings/.test(lower)
  const asksLargest =
    /largest|biggest|highest|large transactions|largest transactions/.test(
      lower
    )
  const asksSpike = /spike|surge|unusual|increase/.test(lower)
  const asksDonations = /donation|charity|church|tithe|giving/.test(lower)
  const asksCreditUtilization = /utilization|credit usage|credit limit/.test(
    lower
  )
  const asksUpcoming = /upcoming|renew|due|next bill|next billing/.test(lower)

  if (asksNetWorth) {
    if (accounts.length === 0) {
      return 'No accounts are connected yet, so I cannot calculate net worth.'
    }

    return [
      `Net worth estimate: ${formatCurrency(netWorthSnapshot.netWorth)}.`,
      `Assets: ${formatCurrency(netWorthSnapshot.assets)}.`,
      `Liabilities: ${formatCurrency(netWorthSnapshot.liabilities)}.`,
    ].join('\n')
  }

  if (asksCreditUtilization) {
    if (creditUtilizationSnapshot.accountCount === 0) {
      return 'No credit card limits are available to calculate utilization.'
    }

    return [
      `Credit utilization: ${creditUtilizationSnapshot.utilization?.toFixed(
        1
      )}% across ${creditUtilizationSnapshot.accountCount} card${
        creditUtilizationSnapshot.accountCount === 1 ? '' : 's'
      }.`,
      `Balances: ${formatCurrency(
        creditUtilizationSnapshot.totalBalance
      )} of ${formatCurrency(creditUtilizationSnapshot.totalLimit)}.`,
    ].join('\n')
  }

  if (asksSpike) {
    if (spikeSnapshot.previousTotal === 0) {
      return 'I do not have enough prior spending history to detect spikes yet.'
    }
    const change = spikeSnapshot.percentChange * 100
    const direction = change >= 0 ? 'up' : 'down'
    return [
      `Spending trend: ${direction} ${Math.abs(change).toFixed(
        0
      )}% over the last 7 days.`,
      `Recent: ${formatCurrency(spikeSnapshot.recentTotal)} vs previous ${formatCurrency(
        spikeSnapshot.previousTotal
      )}.`,
    ].join('\n')
  }

  if (asksLargest) {
    const largestSnapshot = buildLargestExpenseSnapshot(
      transactions,
      30,
      amountThreshold ?? undefined
    )
    if (largestSnapshot.expenses.length === 0) {
      return 'No large expenses found in the last 30 days.'
    }
    const items = largestSnapshot.expenses
      .map(
        (expense) =>
          `${expense.description} (${formatCurrency(
            expense.amount
          )} on ${formatShortDate(expense.date)})`
      )
      .join(', ')
    return `Largest expenses (last 30 days): ${items}.`
  }

  if (asksDonations) {
    if (donationSnapshot.count === 0) {
      return 'No donation-related expenses found in the last 30 days.'
    }
    return `Donations in the last 30 days: ${formatCurrency(
      donationSnapshot.total
    )} across ${donationSnapshot.count} transaction${
      donationSnapshot.count === 1 ? '' : 's'
    }.`
  }

  if (asksCashFlow || asksIncome) {
    if (
      cashFlowSnapshot.incomeCount === 0 &&
      cashFlowSnapshot.expenseCount === 0
    ) {
      return 'I do not see income or expense activity in the last 30 days.'
    }
    const range = `${formatShortDate(
      cashFlowSnapshot.startDate
    )} - ${formatShortDate(cashFlowSnapshot.endDate)}`
    return [
      `Cash flow (last 30 days, ${range}):`,
      `Income: ${formatCurrency(
        cashFlowSnapshot.incomeTotal
      )} across ${cashFlowSnapshot.incomeCount} deposits.`,
      `Expenses: ${formatCurrency(
        cashFlowSnapshot.expenseTotal
      )} across ${cashFlowSnapshot.expenseCount} transactions.`,
      `Net: ${formatCurrency(cashFlowSnapshot.netCashFlow)}.`,
    ].join('\n')
  }

  if ((asksSpending && asksMonthly) || (asksSpending && mentionsCreditCard)) {
    if (spendingSnapshot.transactionCount === 0) {
      return (
        'I do not see any expense transactions in the last 30 days, so I ' +
        'cannot calculate monthly spending yet.'
      )
    }

    const range = `${formatShortDate(
      spendingSnapshot.startDate
    )} - ${formatShortDate(spendingSnapshot.endDate)}`
    const summaryLines = [
      `Last 30 days (${range}) total spending: ${formatCurrency(
        spendingSnapshot.totalSpending
      )}.`,
    ]

    if (spendingSnapshot.creditCardCount > 0) {
      summaryLines.push(
        `Credit cards: ${formatCurrency(
          spendingSnapshot.creditCardSpending
        )} across ${spendingSnapshot.creditCardCount} transactions.`
      )
    } else {
      summaryLines.push('Credit cards: $0.00 (no credit card expenses found).')
    }

    summaryLines.push(
      `Other accounts: ${formatCurrency(
        spendingSnapshot.otherSpending
      )} across ${spendingSnapshot.otherCount} transactions.`
    )

    if (spendingSnapshot.topCategories.length > 0) {
      summaryLines.push(
        `Top categories: ${spendingSnapshot.topCategories
          .map(
            (category) => `${category.name} (${formatCurrency(category.total)})`
          )
          .join(', ')}.`
      )
    }

    return summaryLines.join('\n')
  }

  if (asksTopCategories) {
    if (spendingSnapshot.topCategories.length === 0) {
      return 'I do not see any recent expense data to rank categories yet.'
    }
    return `Top categories (last 30 days): ${spendingSnapshot.topCategories
      .map((category) => `${category.name} (${formatCurrency(category.total)})`)
      .join(', ')}.`
  }

  if (asksCash) {
    if (cashSnapshot.accountCount === 0) {
      return 'No checking or savings accounts are connected yet.'
    }
    return `Checking + savings cash on hand: ${formatCurrency(
      cashSnapshot.totalCash
    )} across ${cashSnapshot.accountCount} accounts.`
  }

  if (asksSubscriptions) {
    if (subscriptions.length === 0) {
      return 'No subscriptions are connected yet.'
    }

    if (asksUpcoming) {
      if (subscriptionSnapshot.upcoming.length === 0) {
        return 'No upcoming subscription renewals are scheduled yet.'
      }

      const upcoming = subscriptionSnapshot.upcoming
        .map((subscription) => {
          const date = subscription.nextBillingDate
            ? subscription.nextBillingDate.toLocaleDateString('en-US')
            : 'TBD'
          return `${subscription.name} on ${date}`
        })
        .join(', ')
      return `Upcoming renewals: ${upcoming}.`
    }

    const upcoming = subscriptionSnapshot.upcoming
      .map((subscription) => {
        const date = subscription.nextBillingDate
          ? subscription.nextBillingDate.toLocaleDateString('en-US')
          : 'TBD'
        return `${subscription.name} (${formatCurrency(
          subscription.amount
        )} ${subscription.billingCycle.toLowerCase()}, next ${date})`
      })
      .join(', ')

    return [
      `Estimated monthly subscriptions total: ${formatCurrency(
        subscriptionSnapshot.monthlyTotal
      )}.`,
      upcoming ? `Upcoming: ${upcoming}.` : null,
    ]
      .filter(Boolean)
      .join('\n')
  }

  return null
}

const buildSnapshotSummary = (context: ChatContext) => {
  const transactions = context.transactions ?? []
  const accounts = context.accounts ?? []
  const subscriptions = context.subscriptions ?? []
  const spendingSnapshot = buildSpendingSnapshot(transactions, accounts, 30)
  const cashFlowSnapshot = buildCashFlowSnapshot(transactions, 30)
  const cashSnapshot = buildCashSnapshot(accounts)
  const subscriptionSnapshot = buildSubscriptionSnapshot(subscriptions)
  const netWorthSnapshot = buildNetWorthSnapshot(accounts)
  const creditUtilizationSnapshot = buildCreditUtilizationSnapshot(accounts)

  return {
    windowDays: spendingSnapshot.windowDays,
    totalSpending: Number(spendingSnapshot.totalSpending.toFixed(2)),
    creditCardSpending: Number(spendingSnapshot.creditCardSpending.toFixed(2)),
    otherSpending: Number(spendingSnapshot.otherSpending.toFixed(2)),
    incomeTotal: Number(cashFlowSnapshot.incomeTotal.toFixed(2)),
    expenseTotal: Number(cashFlowSnapshot.expenseTotal.toFixed(2)),
    netCashFlow: Number(cashFlowSnapshot.netCashFlow.toFixed(2)),
    topCategories: spendingSnapshot.topCategories.map((category) => ({
      name: category.name,
      total: Number(category.total.toFixed(2)),
    })),
    cashOnHand: Number(cashSnapshot.totalCash.toFixed(2)),
    netWorth: Number(netWorthSnapshot.netWorth.toFixed(2)),
    assets: Number(netWorthSnapshot.assets.toFixed(2)),
    liabilities: Number(netWorthSnapshot.liabilities.toFixed(2)),
    creditUtilization:
      creditUtilizationSnapshot.utilization !== undefined
        ? Number(creditUtilizationSnapshot.utilization.toFixed(1))
        : null,
    subscriptionMonthlyTotal: Number(
      subscriptionSnapshot.monthlyTotal.toFixed(2)
    ),
    subscriptionUpcoming: subscriptionSnapshot.upcoming.map((subscription) => ({
      name: subscription.name,
      amount: Number(subscription.amount.toFixed(2)),
      billingCycle: subscription.billingCycle,
      nextBillingDate: subscription.nextBillingDate?.toISOString(),
    })),
  }
}

function buildOpenRouterHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (OPENROUTER_API_KEY) {
    headers.Authorization = `Bearer ${OPENROUTER_API_KEY}`
  }

  if (OPENROUTER_SITE_URL) {
    headers['HTTP-Referer'] = OPENROUTER_SITE_URL
  }

  if (OPENROUTER_SITE_NAME) {
    headers['X-Title'] = OPENROUTER_SITE_NAME
  }

  return headers
}

/**
 * Check if OpenRouter is configured and available
 */
export async function checkOpenRouterStatus(): Promise<boolean> {
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key not configured')
    return false
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: buildOpenRouterHeaders(),
    })
    return response.ok
  } catch (error) {
    console.error('OpenRouter not available:', error)
    return false
  }
}

/**
 * Get available models from OpenRouter
 */
export async function getAvailableModels(): Promise<string[]> {
  if (!OPENROUTER_API_KEY) {
    return []
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: buildOpenRouterHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch models')

    const data = await response.json()
    return data.data?.map((model: { id: string }) => model.id) || []
  } catch (error) {
    console.error('Failed to get models:', error)
    return []
  }
}

/**
 * Generate response using OpenRouter
 */
async function callOpenRouter(
  messages: AIMessage[],
  model: string = OPENROUTER_MODEL
): Promise<string> {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured.')
    }

    const buildRequestBody = (modelOverride?: string) => {
      const body: Record<string, unknown> = {
        messages,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 200,
      }

      if (modelOverride) {
        body.model = modelOverride
      }

      return body
    }

    console.log('Calling OpenRouter with model:', model || 'default')

    let response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: buildOpenRouterHeaders(),
      body: JSON.stringify(buildRequestBody(model)),
    })

    if (!response.ok && response.status === 404 && model) {
      response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: buildOpenRouterHeaders(),
        body: JSON.stringify(buildRequestBody()),
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const result = data.choices?.[0]?.message?.content?.trim()
    if (!result) {
      throw new Error('No response generated')
    }

    console.log('OpenRouter response:', result)
    return result
  } catch (error) {
    console.error('OpenRouter request failed:', error)
    throw error
  }
}

/**
 * Categorize a transaction using hosted AI
 */
export async function categorizeTransaction(
  description: string,
  amount: number
): Promise<CategorizationResult> {
  try {
    // Simple rule-based fallback first
    const simpleCategory = getSimpleCategory(description.toLowerCase())

    const messages: AIMessage[] = [
      {
        role: 'system',
        content:
          'You are a financial transaction categorizer. Given a transaction description and amount, respond with ONLY one of these categories: Food & Dining, Transportation, Shopping, Entertainment, Healthcare, Utilities, Housing, Education, Travel, Insurance, Investment, Salary, Freelance, Gifts, Subscriptions, Other. Do not include any other text in your response.',
      },
      {
        role: 'user',
        content: `Categorize this transaction: "${description}" $${amount}`,
      },
    ]

    const response = await callOpenRouter(messages)

    // Clean up the response to extract just the category
    const category = response
      .trim()
      .split('\n')[0]
      .replace(/[^a-zA-Z]/g, '')
      .toLowerCase()

    // Map to proper category names
    const categoryMap: { [key: string]: string } = {
      food: 'Food & Dining',
      dining: 'Food & Dining',
      transportation: 'Transportation',
      transport: 'Transportation',
      shopping: 'Shopping',
      entertainment: 'Entertainment',
      healthcare: 'Healthcare',
      health: 'Healthcare',
      utilities: 'Utilities',
      utility: 'Utilities',
      housing: 'Housing',
      home: 'Housing',
      education: 'Education',
      travel: 'Travel',
      insurance: 'Insurance',
      investment: 'Investment',
      salary: 'Salary',
      freelance: 'Freelance',
      gifts: 'Gifts',
      gift: 'Gifts',
      subscriptions: 'Subscriptions',
      subscription: 'Subscriptions',
      other: 'Other',
    }

    const finalCategory = categoryMap[category] || simpleCategory

    return {
      category: finalCategory,
      confidence: 0.8,
      tags: [finalCategory.toLowerCase()],
    }
  } catch (error) {
    console.error('AI categorization failed, using fallback:', error)
    return {
      category: getSimpleCategory(description.toLowerCase()),
      confidence: 0.3,
      tags: ['fallback'],
    }
  }
}

/**
 * Simple rule-based categorization fallback
 */
function getSimpleCategory(description: string): string {
  const categories = {
    'Food & Dining': [
      'restaurant',
      'cafe',
      'food',
      'grocery',
      'pizza',
      'coffee',
      'lunch',
      'dinner',
      'mcdonalds',
      'starbucks',
      'subway',
      'kfc',
      'burger',
      'taco',
      'sushi',
      'dining',
      'meal',
    ],
    Transportation: [
      'uber',
      'lyft',
      'gas',
      'fuel',
      'parking',
      'taxi',
      'transit',
      'bus',
      'train',
      'metro',
      'subway',
      'airport',
      'car',
      'auto',
      'transport',
    ],
    Shopping: [
      'amazon',
      'store',
      'shop',
      'retail',
      'mall',
      'buy',
      'walmart',
      'target',
      'costco',
      'ikea',
      'nike',
      'adidas',
      'clothing',
      'apparel',
    ],
    Entertainment: [
      'movie',
      'netflix',
      'spotify',
      'game',
      'concert',
      'theater',
      'cinema',
      'youtube',
      'hulu',
      'disney',
      'hbo',
      'music',
      'gaming',
    ],
    Utilities: [
      'electric',
      'water',
      'phone',
      'internet',
      'utility',
      'cable',
      'wifi',
      'electricity',
      'gas',
      'heating',
    ],
    Housing: ['rent', 'mortgage', 'home', 'house', 'apartment'],
    Healthcare: [
      'doctor',
      'pharmacy',
      'medical',
      'health',
      'dentist',
      'hospital',
      'clinic',
      'cvs',
      'walgreens',
      'medicine',
      'prescription',
      'therapy',
    ],
    Education: [
      'school',
      'university',
      'college',
      'course',
      'class',
      'tuition',
      'textbook',
      'education',
      'learning',
    ],
    Travel: [
      'hotel',
      'flight',
      'airline',
      'vacation',
      'trip',
      'travel',
      'booking',
      'airbnb',
      'resort',
    ],
    Insurance: ['insurance', 'premium', 'policy', 'coverage'],
    Investment: [
      'investment',
      'stock',
      'portfolio',
      'trading',
      'brokerage',
      'fund',
      'etf',
    ],
    Salary: ['salary', 'payroll', 'income', 'wage', 'payment', 'deposit'],
    Freelance: ['freelance', 'contract', 'consulting', 'gig', 'project'],
    Gifts: ['gift', 'donation', 'charity', 'present'],
    Subscriptions: [
      'subscription',
      'monthly',
      'recurring',
      'membership',
      'plan',
    ],
  }

  const lowerDescription = description.toLowerCase()
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => lowerDescription.includes(keyword))) {
      return category
    }
  }
  return 'Other'
}

/**
 * Generate financial insights using hosted AI
 */
export async function generateFinancialInsights(
  transactions: Array<{
    id: string
    description: string
    amount: number
    category?: string
    date: string | Date
    type: string
  }>,
  budgets: Array<{
    id: string
    name: string
    amount: number
    category?: string
  }>,
  goals: Array<{
    id: string
    name: string
    targetAmount: number
    currentAmount: number
  }>
): Promise<FinancialInsight[]> {
  try {
    const totalSpent = transactions.reduce(
      (sum, t) => sum + Math.abs(t.amount || 0),
      0
    )
    const avgTransaction = totalSpent / Math.max(transactions.length, 1)

    const messages: AIMessage[] = [
      {
        role: 'system',
        content:
          'You are a financial advisor. Analyze the given financial data and provide one specific, actionable insight. Keep your response under 100 words and focus on practical advice.',
      },
      {
        role: 'user',
        content: `Analyze this financial data: ${transactions.length} transactions, total spent: $${totalSpent.toFixed(2)}, average transaction: $${avgTransaction.toFixed(2)}, ${budgets.length} budgets, ${goals.length} goals.`,
      },
    ]

    const response = await callOpenRouter(messages)

    return [
      {
        type: 'spending_pattern',
        title: 'AI Financial Insight',
        description: response.trim(),
        severity: 'medium',
        actionable: true,
      },
    ]
  } catch (error) {
    console.error('AI insights failed:', error)
    return [
      {
        type: 'spending_pattern',
        title: 'Spending Summary',
        description: `You have ${transactions.length} transactions totaling $${transactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0).toFixed(2)}. Review your spending patterns regularly.`,
        severity: 'low',
        actionable: true,
      },
    ]
  }
}

/**
 * Chat with hosted AI assistant
 */
export async function chatWithAI(
  message: string,
  context: ChatContext = {}
): Promise<string> {
  try {
    console.log('💬 AI chat request:', message)

    const deterministicAnswer = buildDeterministicAnswer(message, context)
    if (deterministicAnswer) {
      return deterministicAnswer
    }

    const fallbackSummary = buildFallbackSummary(context)
    if (!OPENROUTER_API_KEY) {
      return fallbackSummary
    }

    const snapshotSummary = buildSnapshotSummary(context)
    const snapshotTail = buildSnapshotTail(context)

    const messages: AIMessage[] = [
      {
        role: 'system',
        content:
          'You are a financial assistant inside a personal finance app. ' +
          'Use ONLY the provided data snapshot to answer. If data is missing, ' +
          'say what is missing. Keep responses under 150 words and avoid generic advice.' +
          `\nData snapshot: ${JSON.stringify(snapshotSummary)}`,
      },
      {
        role: 'user',
        content: message,
      },
    ]

    const response = await callOpenRouter(messages)
    const trimmed = response.trim()
    if (!trimmed) {
      return fallbackSummary
    }
    if (snapshotTail) {
      return `${trimmed}\n\n${snapshotTail}`
    }
    return trimmed
  } catch (error) {
    console.error('AI chat failed:', error)
    return buildFallbackSummary(context)
  }
}

/**
 * Bulk categorize transactions
 */
export async function bulkCategorizeTransactions(
  transactions: Array<{
    id: string
    description?: string
    name?: string
    amount: number
  }>
): Promise<{ [transactionId: string]: CategorizationResult }> {
  const results: { [transactionId: string]: CategorizationResult } = {}

  for (const transaction of transactions) {
    try {
      const result = await categorizeTransaction(
        transaction.description || transaction.name || '',
        Math.abs(transaction.amount || 0)
      )
      results[transaction.id] = result
    } catch (error) {
      console.error(
        `Failed to categorize transaction ${transaction.id}:`,
        error
      )
      results[transaction.id] = {
        category: 'Other',
        confidence: 0.1,
        tags: ['error'],
      }
    }
  }

  return results
}
