// local-ai.ts - Hosted AI implementation using OpenRouter

interface AIMessage {
  role: 'system' | 'user'
  content: string
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

// OpenRouter configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_BASE_URL =
  process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free'
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL
const OPENROUTER_SITE_NAME = process.env.OPENROUTER_SITE_NAME

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

    console.log('Calling OpenRouter with model:', model)

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: buildOpenRouterHeaders(),
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 200,
      }),
    })

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
  transactions: Array<{ id: string; description: string; amount: number; category?: string; date: string | Date; type: string }>,
  budgets: Array<{ id: string; name: string; amount: number; category?: string }>,
  goals: Array<{ id: string; name: string; targetAmount: number; currentAmount: number }>
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
      context: { transactions: Array<{ description: string; amount: number; category?: string }>; budgets: Array<{ name: string; amount: number }>; goals: Array<{ name: string; targetAmount: number; currentAmount: number }> }
): Promise<string> {
  try {
    console.log('💬 AI chat request:', message)

    const messages: AIMessage[] = [
      {
        role: 'system',
        content:
          'You are a helpful financial assistant. Provide brief, practical financial advice. Keep responses under 150 words and focus on actionable tips.',
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
  transactions: Array<{ id: string; description?: string; name?: string; amount: number }>
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
