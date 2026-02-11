// hosted-ai.ts

const sanitizeEnvValue = (value?: string) =>
  value ? value.replace(/^['"]|['"]$/g, '').trim() : ''

/**
 * OpenRouter API wrapper
 */
const OPENROUTER_API_KEY = sanitizeEnvValue(process.env.OPENROUTER_API_KEY)
const OPENROUTER_BASE_URL =
  sanitizeEnvValue(process.env.OPENROUTER_BASE_URL) ||
  'https://openrouter.ai/api/v1'
const OPENROUTER_MODEL = sanitizeEnvValue(process.env.OPENROUTER_MODEL)
const OPENROUTER_SITE_URL = sanitizeEnvValue(process.env.OPENROUTER_SITE_URL)
const OPENROUTER_SITE_NAME = sanitizeEnvValue(process.env.OPENROUTER_SITE_NAME)

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

interface AIMessage {
  role: 'system' | 'user'
  content: string
}

/**
 * Test function to check if the API and model are working
 */
export async function testHuggingFaceAPI(): Promise<void> {
  if (!OPENROUTER_API_KEY) {
    console.log('OpenRouter API key not configured')
    return
  }

  console.log('Testing OpenRouter API...')
  try {
    const res = await fetch(`${OPENROUTER_BASE_URL}/models`, {
      headers: buildOpenRouterHeaders(),
    })

    console.log(`Status: ${res.status} ${res.statusText}`)

    if (res.ok) {
      const data = await res.json()
      console.log('Success! Model count:', data.data?.length || 0)
      return
    }

    const error = await res.text()
    console.log('Error response:', error)
  } catch (error) {
    console.log('Network error:', error)
  }
}

/**
 * Builds a simple prompt string from messages.
 */
function buildPrompt(messages: AIMessage[]): string {
  return messages
    .map((m) =>
      m.role === 'system' ? `System: ${m.content}\n` : `User: ${m.content}\n`
    )
    .join('')
}

/**
 * Make a request to OpenRouter with better error handling
 */
async function callOpenRouter(messages: AIMessage[]): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured')
  }

  const prompt = buildPrompt(messages)
  const endpoint = `${OPENROUTER_BASE_URL}/chat/completions`

  console.log('Making request to:', endpoint)
  console.log('Prompt:', prompt.substring(0, 100) + '...')

  const buildRequestBody = (modelOverride?: string) => {
    const body: Record<string, unknown> = {
      messages,
      max_tokens: 100,
      temperature: 0.7,
    }

    if (modelOverride) {
      body.model = modelOverride
    }

    return body
  }

  try {
    let res = await fetch(endpoint, {
      method: 'POST',
      headers: buildOpenRouterHeaders(),
      body: JSON.stringify(buildRequestBody(OPENROUTER_MODEL)),
    })

    if (!res.ok && res.status === 404 && OPENROUTER_MODEL) {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: buildOpenRouterHeaders(),
        body: JSON.stringify(buildRequestBody()),
      })
    }

    console.log('Response status:', res.status, res.statusText)

    if (!res.ok) {
      const errorText = await res.text()
      console.error('API Error:', errorText)

      if (res.status === 404) {
        const modelName = OPENROUTER_MODEL || 'default'
        throw new Error(
          `Model not found: ${modelName}. Try a different model.`
        )
      }
      if (res.status === 401) {
        throw new Error('Invalid API key. Check your OPENROUTER_API_KEY.')
      }
      if (res.status === 429) {
        throw new Error('Rate limit exceeded. Try again later.')
      }

      throw new Error(`API request failed: ${res.status} - ${errorText}`)
    }

    const data = await res.json()
    console.log('Raw response:', data)

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      console.error('Unexpected response format:', data)
      throw new Error('Unexpected response format from API')
    }

    return content
  } catch (error) {
    console.error('Request failed:', error)
    throw error
  }
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

/**
 * Categorize a transaction with fallback logic
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
        content: `You are a financial transaction categorizer. Categorize the transaction into one of these categories:

Food & Dining - restaurants, cafes, fast food, groceries, coffee shops, McDonald's
Transportation - gas, parking, rideshare, public transit, car services, bicycle shops
Shopping - retail stores, online shopping, clothing, electronics
Entertainment - movies, streaming, games, concerts, hobbies
Healthcare - medical, dental, pharmacy, health services
Utilities - electricity, water, internet, phone bills
Housing - rent, mortgage, home maintenance
Education - tuition, books, courses, training
Travel - flights, hotels, vacation expenses
Insurance - health, car, home, life insurance
Investment - stocks, bonds, retirement accounts
Salary - regular employment income, payroll deposits, ACH credits
Freelance - contract work, consulting income
Gifts - presents, donations to individuals
Subscriptions - recurring services, memberships
Services - professional services, repairs, maintenance
Technology - software, apps, tech equipment, electronics components
Business - work expenses, office supplies, business meals
Personal Care - haircuts, beauty, grooming
Fitness - gym, sports, exercise equipment
Pets - pet food, vet bills, pet services
Charity - donations to organizations
Legal - legal fees, court costs
Taxes - tax payments, filing fees

Respond with ONLY the category name.`,
      },
      {
        role: 'user',
        content: `Transaction: "${description}" Amount: $${amount}`,
      },
    ]

    const response = await callOpenRouter(messages)
    const category =
      response
        .trim()
        .split('\n')[0]
        .replace(/[^a-zA-Z\s&]/g, '')
        .trim() || simpleCategory

    return {
      category: category,
      confidence: 0.8,
      tags: [category.toLowerCase()],
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
      'breakfast',
      'mcdonalds',
      'mcdonald',
      'burger',
      'taco',
      'sushi',
      'chinese',
      'italian',
      'starbucks',
      'subway',
      'kfc',
      'wendys',
      'chipotle',
      'dominos',
      'papa johns',
      'dunkin',
      'dunkin donuts',
      'taco bell',
      'burger king',
      'five guys',
      'shake shack',
      'in-n-out',
      'whataburger',
      'culvers',
      'sonic',
      'arby',
      'popeyes',
      'chick-fil-a',
      'chick fil a',
      'zaxby',
      'bojangles',
      'raising canes',
      'canes',
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
      'bicycle',
      'bike',
      'madison bicycle',
      'bicycle shop',
      'car wash',
      'auto',
      'repair',
      'oil change',
      'tire',
      'brake',
      'transmission',
      'mechanic',
      'dealership',
      'car dealer',
      'auto parts',
      'napa',
      'oreilly',
      'autozone',
      'advance auto',
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
      'best buy',
      'home depot',
      'lowes',
      'ikea',
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
      'show',
      'sparkfun',
      'hobby',
      'craft',
      'art',
      'music',
      'streaming',
      'youtube',
      'disney',
      'hulu',
      'hbo',
      'paramount',
      'peacock',
      'apple tv',
      'prime video',
      'amazon prime',
      'twitch',
      'tiktok',
      'instagram',
      'facebook',
      'twitter',
      'reddit',
      'discord',
      'steam',
      'playstation',
      'xbox',
      'nintendo',
      'esports',
      'gaming',
    ],
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
      'rite aid',
      'prescription',
      'medicine',
    ],
    Utilities: [
      'electric',
      'water',
      'phone',
      'internet',
      'cable',
      'wifi',
      'power',
      'gas company',
      'utility',
      'energy',
    ],
    Technology: [
      'sparkfun',
      'electronics',
      'computer',
      'laptop',
      'desktop',
      'tablet',
      'smartphone',
      'phone',
      'software',
      'app',
      'subscription',
      'saas',
      'cloud',
      'server',
      'hosting',
      'domain',
      'website',
      'web hosting',
      'github',
      'gitlab',
      'bitbucket',
      'aws',
      'amazon web services',
      'google cloud',
      'azure',
      'microsoft azure',
      'digitalocean',
      'heroku',
      'vercel',
      'netlify',
      'shopify',
      'wordpress',
      'squarespace',
      'wix',
      'weebly',
      'figma',
      'adobe',
      'creative cloud',
      'office 365',
      'microsoft office',
      'google workspace',
      'g suite',
      'slack',
      'zoom',
      'teams',
      'discord',
      'notion',
      'asana',
      'trello',
      'jira',
      'confluence',
      'dropbox',
      'google drive',
      'onedrive',
      'icloud',
      'backblaze',
      'carbonite',
      'lastpass',
      '1password',
      'bitwarden',
      'dashlane',
      'nordvpn',
      'expressvpn',
      'surfshark',
      'protonvpn',
    ],
    Services: [
      'tectra',
      'tectra inc',
      'consulting',
      'professional',
      'expert',
      'service',
      'repair',
      'maintenance',
      'cleaning',
      'laundry',
      'dry cleaning',
      'landscaping',
      'gardening',
      'pool service',
      'housekeeping',
      'maid service',
      'janitorial',
      'security',
      'alarm',
      'monitoring',
      'installation',
      'setup',
      'assembly',
      'delivery',
      'shipping',
      'freight',
      'logistics',
      'storage',
      'warehouse',
      'moving',
      'relocation',
      'packing',
      'unpacking',
      'organizing',
      'decluttering',
      'interior design',
      'decorating',
      'renovation',
      'remodeling',
      'construction',
      'contractor',
      'plumber',
      'electrician',
      'hvac',
      'heating',
      'cooling',
      'ac repair',
      'heater repair',
      'furnace repair',
      'appliance repair',
      'computer repair',
      'phone repair',
      'screen repair',
      'battery replacement',
      'key replacement',
      'lock repair',
      'garage door',
      'gate repair',
      'fence repair',
      'roof repair',
      'gutter cleaning',
      'window cleaning',
      'pressure washing',
      'pest control',
      'exterminator',
      'termite',
      'rodent',
      'insect',
      'weed control',
      'fertilizer',
      'irrigation',
      'sprinkler',
      'tree service',
      'tree trimming',
      'tree removal',
      'stump grinding',
      'mulch',
      'soil',
      'compost',
      'fertilizer',
      'pesticide',
      'herbicide',
    ],
    Housing: [
      'rent',
      'mortgage',
      'home',
      'apartment',
      'house',
      'maintenance',
      'repair',
      'furniture',
      'appliance',
      'home depot',
      'lowes',
    ],
    Education: [
      'tuition',
      'school',
      'college',
      'university',
      'course',
      'training',
      'book',
      'textbook',
      'library',
      'student',
    ],
    Travel: [
      'hotel',
      'flight',
      'airline',
      'vacation',
      'trip',
      'travel',
      'airbnb',
      'booking',
      'expedia',
      'orbitz',
    ],
    Insurance: [
      'insurance',
      'geico',
      'state farm',
      'allstate',
      'progressive',
      'health',
      'car insurance',
      'home insurance',
      'life insurance',
    ],
    Investment: [
      'investment',
      'stock',
      'bond',
      'retirement',
      '401k',
      'ira',
      'robinhood',
      'fidelity',
      'vanguard',
      'schwab',
    ],
    Salary: [
      'salary',
      'payroll',
      'deposit',
      'direct deposit',
      'paycheck',
      'income',
      'gusto',
      'pay',
      'wage',
    ],
    Freelance: [
      'freelance',
      'contract',
      'consulting',
      'upwork',
      'fiverr',
      'gig',
      'independent',
      'self-employed',
    ],
    Gifts: ['gift', 'present', 'donation', 'charity', 'give', 'contribution'],
    Subscriptions: [
      'subscription',
      'membership',
      'recurring',
      'monthly',
      'annual',
      'netflix',
      'spotify',
      'hulu',
      'disney',
      'amazon prime',
    ],
    Business: [
      'business',
      'office',
      'work',
      'professional',
      'corporate',
      'meeting',
      'conference',
      'expense',
      'client',
    ],
    'Personal Care': [
      'haircut',
      'salon',
      'beauty',
      'grooming',
      'spa',
      'massage',
      'nail',
      'cosmetic',
      'personal care',
    ],
    Fitness: [
      'gym',
      'fitness',
      'workout',
      'exercise',
      'sports',
      'athletic',
      'planet fitness',
      'la fitness',
      '24 hour fitness',
    ],
    Pets: [
      'pet',
      'dog',
      'cat',
      'veterinary',
      'vet',
      'animal',
      'petco',
      'petsmart',
    ],
    Charity: [
      'charity',
      'donation',
      'nonprofit',
      'foundation',
      'cause',
      'help',
    ],
    Legal: ['legal', 'lawyer', 'attorney', 'court', 'law', 'legal fee'],
    Taxes: ['tax', 'irs', 'filing', 'tax return', 'tax payment'],
  }

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => description.includes(keyword))) {
      return category
    }
  }
  return 'Other'
}

/**
 * Generate financial insights with fallback
 */
export async function generateFinancialInsights(
  transactions: Array<{ id: string; description: string; amount: number; category?: string; date: string | Date; type: string }>,
  budgets: Array<{ id: string; name: string; amount: number; category?: string }>,
  goals: Array<{ id: string; name: string; targetAmount: number; currentAmount: number }>
): Promise<FinancialInsight[]> {
  try {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'Analyze spending and give one financial tip.',
      },
      {
        role: 'user',
        content: `${transactions.length} transactions totaling $${transactions.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)}`,
      },
    ]

    const response = await callOpenRouter(messages)

    return [
      {
        type: 'spending_pattern',
        title: 'AI Insight',
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
        description: `You have ${transactions.length} transactions. Review your spending patterns regularly.`,
        severity: 'low',
        actionable: true,
      },
    ]
  }
}

/**
 * Chat with AI assistant
 */
export async function chatWithAI(
  message: string,
      context: { transactions: Array<{ description: string; amount: number; category?: string }>; budgets: Array<{ name: string; amount: number }>; goals: Array<{ name: string; targetAmount: number; currentAmount: number }> }
): Promise<string> {
  try {
    console.log('💬 Chat request:', message)

    const messages: AIMessage[] = [
      {
        role: 'system',
        content:
          'You are a helpful financial assistant. Give brief, helpful advice.',
      },
      {
        role: 'user',
        content: message,
      },
    ]

    const response = await callOpenRouter(messages)
    return (
      response.trim() ||
      'I understand your question. Could you please be more specific?'
    )
  } catch (error) {
    console.error('Chat failed:', error)
    return `I'm having trouble connecting to the AI service. Your question: "${message}" - I'd recommend checking your recent transactions and budgets manually for now.`
  }
}
