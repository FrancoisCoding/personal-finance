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

const buildDeterministicAnswer = (message: string, context: ChatContext) => {
  const lower = message.toLowerCase()
  const transactions = context.transactions ?? []
  const accounts = context.accounts ?? []
  const subscriptions = context.subscriptions ?? []

  const spendingSnapshot = buildSpendingSnapshot(transactions, accounts, 30)
  const cashSnapshot = buildCashSnapshot(accounts)
  const subscriptionSnapshot = buildSubscriptionSnapshot(subscriptions)

  const asksSpending = /spend|spending|spent|outflow|expense/.test(lower)
  const asksMonthly =
    /per month|monthly|this month|last 30 days|past 30 days/.test(lower)
  const mentionsCreditCard = /credit card|creditcard|card/.test(lower)
  const asksTopCategories = /top (three|3)? .*categories|top categories/.test(
    lower
  )
  const asksCash = /cash|checking|savings/.test(lower)
  const asksSubscriptions = /subscription|recurring/.test(lower)

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
  const cashSnapshot = buildCashSnapshot(accounts)
  const subscriptionSnapshot = buildSubscriptionSnapshot(subscriptions)

  return {
    windowDays: spendingSnapshot.windowDays,
    totalSpending: Number(spendingSnapshot.totalSpending.toFixed(2)),
    creditCardSpending: Number(spendingSnapshot.creditCardSpending.toFixed(2)),
    otherSpending: Number(spendingSnapshot.otherSpending.toFixed(2)),
    topCategories: spendingSnapshot.topCategories.map((category) => ({
      name: category.name,
      total: Number(category.total.toFixed(2)),
    })),
    cashOnHand: Number(cashSnapshot.totalCash.toFixed(2)),
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

    const snapshotSummary = buildSnapshotSummary(context)

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
    return (
      response.trim() ||
      'I understand your question. Could you please be more specific about your financial situation?'
    )
  } catch (error) {
    console.error('AI chat failed:', error)
    return `I'm having trouble with the AI service right now. Your question: "${message}" - I'd recommend checking your recent transactions and budgets manually for now.`
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
