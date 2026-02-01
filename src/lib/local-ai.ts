// local-ai.ts - Local AI implementation using Ollama

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

// Default Ollama configuration
const OLLAMA_BASE_URL =
  process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434'
const DEFAULT_MODEL = process.env.NEXT_PUBLIC_OLLAMA_MODEL || 'llama2:7b'

/**
 * Check if Ollama is running and available
 */
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    return response.ok
  } catch (error) {
    console.error('Ollama not available:', error)
    return false
  }
}

/**
 * Get available models from Ollama
 */
export async function getAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`)
    if (!response.ok) throw new Error('Failed to fetch models')

    const data = await response.json()
    return data.models?.map((model: { name: string }) => model.name) || []
  } catch (error) {
    console.error('Failed to get models:', error)
    return []
  }
}

/**
 * Pull a model if it's not available
 */
export async function pullModel(modelName: string): Promise<boolean> {
  try {
    console.log(`Pulling model: ${modelName}`)
    const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    })

    if (!response.ok) throw new Error('Failed to pull model')

    // Wait for the pull to complete
    const reader = response.body?.getReader()
    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n').filter((line) => line.trim())

        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.status === 'success') {
              console.log('Model pulled successfully')
              return true
            }
          } catch (e) {
            // Ignore parsing errors for partial chunks
          }
        }
      }
    }

    return true
  } catch (error) {
    console.error('Failed to pull model:', error)
    return false
  }
}

/**
 * Generate response using Ollama
 */
async function callOllama(
  messages: AIMessage[],
  model: string = DEFAULT_MODEL
): Promise<string> {
  try {
    // Check if Ollama is available
    const isAvailable = await checkOllamaStatus()
    if (!isAvailable) {
      throw new Error('Ollama is not running. Please start Ollama first.')
    }

    // Check if model is available, pull if not
    const availableModels = await getAvailableModels()
    if (!availableModels.includes(model)) {
      console.log(`Model ${model} not found, attempting to pull...`)
      const pulled = await pullModel(model)
      if (!pulled) {
        throw new Error(`Failed to pull model: ${model}`)
      }
    }

    // Build the prompt
    const prompt =
      messages
        .map((m) =>
          m.role === 'system' ? `System: ${m.content}` : `User: ${m.content}`
        )
        .join('\n\n') + '\n\nAssistant:'

    console.log('🤖 Calling Ollama with model:', model)
    console.log('📝 Prompt:', prompt.substring(0, 200) + '...')

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 200,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const result = data.response?.trim() || 'No response generated'

    console.log('✅ Ollama response:', result)
    return result
  } catch (error) {
    console.error('❌ Ollama request failed:', error)
    throw error
  }
}

/**
 * Categorize a transaction using local AI
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

    const response = await callOllama(messages)

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
    console.error('❌ Local AI categorization failed, using fallback:', error)
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
 * Generate financial insights using local AI
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

    const response = await callOllama(messages)

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
    console.error('❌ Local AI insights failed:', error)
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
 * Chat with local AI assistant
 */
export async function chatWithAI(
  message: string,
      context: { transactions: Array<{ description: string; amount: number; category?: string }>; budgets: Array<{ name: string; amount: number }>; goals: Array<{ name: string; targetAmount: number; currentAmount: number }> }
): Promise<string> {
  try {
    console.log('💬 Local AI chat request:', message)

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

    const response = await callOllama(messages)
    return (
      response.trim() ||
      'I understand your question. Could you please be more specific about your financial situation?'
    )
  } catch (error) {
    console.error('❌ Local AI chat failed:', error)
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
