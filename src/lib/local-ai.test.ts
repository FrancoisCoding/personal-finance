import { createFetchResponse } from '../../tests/test-utils'

const originalEnv = { ...process.env }

const resetEnv = () => {
  process.env = { ...originalEnv }
}

const setEnv = (next: Record<string, string | undefined>) => {
  Object.entries(next).forEach(([key, value]) => {
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  })
}

describe('local-ai', () => {
  afterEach(() => {
    resetEnv()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.useRealTimers()
    vi.resetModules()
  })

  it('reports OpenRouter availability', async () => {
    setEnv({ OPENROUTER_API_KEY: '' })
    const { checkOpenRouterStatus } = await import('./local-ai')
    expect(await checkOpenRouterStatus()).toBe(false)

    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    vi.resetModules()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createFetchResponse({ ok: true }))
      .mockRejectedValueOnce(new Error('offline'))
    vi.stubGlobal('fetch', fetchMock)

    const { checkOpenRouterStatus: checkAgain } = await import('./local-ai')
    expect(await checkAgain()).toBe(true)
    expect(await checkAgain()).toBe(false)
  })

  it('returns available model IDs when configured', async () => {
    setEnv({ OPENROUTER_API_KEY: '' })
    const { getAvailableModels } = await import('./local-ai')
    expect(await getAvailableModels()).toEqual([])

    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    vi.resetModules()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({
          ok: true,
          json: { data: [{ id: 'model-a' }, { id: 'model-b' }] },
        })
      )
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { getAvailableModels: getModels } = await import('./local-ai')
    expect(await getModels()).toEqual(['model-a', 'model-b'])
    expect(await getModels()).toEqual([])
  })

  it('categorizes transactions using OpenRouter and fallbacks', async () => {
    setEnv({
      OPENROUTER_API_KEY: 'key',
      OPENROUTER_BASE_URL: 'https://api',
      OPENROUTER_MODEL: 'missing',
    })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 404, text: 'missing' })
      )
      .mockResolvedValueOnce(
        createFetchResponse({
          ok: true,
          json: { choices: [{ message: { content: 'Food' } }] },
        })
      )
      .mockResolvedValueOnce(
        createFetchResponse({
          ok: true,
          json: { choices: [{ message: { content: 'unknown' } }] },
        })
      )
      .mockRejectedValueOnce(new Error('network'))
    vi.stubGlobal('fetch', fetchMock)

    const { categorizeTransaction } = await import('./local-ai')
    const mapped = await categorizeTransaction('Coffee shop', 4)
    expect(mapped.category).toBe('Food & Dining')

    const fallback = await categorizeTransaction('Starbucks', 5)
    expect(fallback.category).toBe('Food & Dining')

    const failed = await categorizeTransaction('Uber ride', 10)
    expect(failed.category).toBe('Transportation')
    expect(failed.confidence).toBe(0.3)
  })

  it('answers spending questions deterministically', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { chatWithAI } = await import('./local-ai')
    const response = await chatWithAI(
      'How much am I spending per month on credit cards?',
      {
        transactions: [
          {
            description: 'Groceries',
            amount: -100,
            category: 'Groceries',
            type: 'EXPENSE',
            date: '2026-02-10',
            accountId: 'cc1',
          },
          {
            description: 'Gas',
            amount: -50,
            category: 'Transportation',
            type: 'EXPENSE',
            date: '2026-02-12',
            accountType: 'CHECKING',
          },
          {
            description: 'Salary',
            amount: 200,
            type: 'INCOME',
            date: '2026-02-11',
          },
          {
            description: 'Old',
            amount: -40,
            type: 'EXPENSE',
            date: '2025-12-01',
          },
          {
            description: 'Invalid',
            amount: -20,
            type: 'EXPENSE',
            date: 'invalid',
          },
        ],
        accounts: [
          { id: 'cc1', type: 'CREDIT_CARD', balance: -200 },
          { id: 'chk1', type: 'CHECKING', balance: 800 },
          { id: 'sav1', type: 'SAVINGS', balance: 500 },
        ],
        subscriptions: [
          {
            name: 'Weekly',
            amount: 10,
            billingCycle: 'WEEKLY',
            nextBillingDate: '2026-02-20',
          },
          {
            name: 'Quarterly',
            amount: 30,
            billingCycle: 'QUARTERLY',
            nextBillingDate: '2026-02-25',
          },
          {
            name: 'Yearly',
            amount: 120,
            billingCycle: 'YEARLY',
            nextBillingDate: '2026-03-01',
          },
          {
            name: 'Invalid',
            amount: 5,
            billingCycle: 'MONTHLY',
            nextBillingDate: 'bad-date',
          },
        ],
      }
    )

    expect(response).toContain('total spending: $150.00')
    expect(response).toContain('Credit cards: $100.00')
    expect(response).toContain('Other accounts: $50.00')
    expect(response).toContain('Groceries')
  })

  it('answers top categories, cash, and subscription prompts', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { chatWithAI } = await import('./local-ai')
    const noData = await chatWithAI('top categories', {})
    expect(noData).toContain('do not see any recent expense')

    const cash = await chatWithAI('cash position', {
      accounts: [{ id: 'chk', type: 'CHECKING', balance: 250 }],
    })
    expect(cash).toContain('Checking + savings cash on hand')

    const subscriptions = await chatWithAI('show subscriptions', {
      subscriptions: [
        {
          name: 'Streaming',
          amount: 15,
          billingCycle: 'MONTHLY',
          nextBillingDate: '2026-02-20',
        },
      ],
    })
    expect(subscriptions).toContain('Estimated monthly subscriptions total')
    expect(subscriptions).toContain('Upcoming:')

    const none = await chatWithAI('recurring charges', {
      subscriptions: [],
    })
    expect(none).toContain('No subscriptions are connected')
  })

  it('answers cash flow, net worth, and credit utilization prompts', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { chatWithAI } = await import('./local-ai')
    const context = {
      transactions: [
        {
          description: 'Salary',
          amount: 2000,
          type: 'INCOME',
          date: '2026-02-05',
        },
        {
          description: 'Rent',
          amount: -500,
          type: 'EXPENSE',
          date: '2026-02-08',
        },
      ],
      accounts: [
        { id: 'chk', type: 'CHECKING', balance: 1000 },
        { id: 'sav', type: 'SAVINGS', balance: 500 },
        { id: 'cc1', type: 'CREDIT_CARD', balance: -300, creditLimit: 2000 },
      ],
      subscriptions: [],
    }

    const cashFlow = await chatWithAI('cash flow summary', context)
    expect(cashFlow).toContain('Cash flow')
    expect(cashFlow).toContain('Income: $2,000.00')
    expect(cashFlow).toContain('Expenses: $500.00')
    expect(cashFlow).toContain('Net: $1,500.00')

    const netWorth = await chatWithAI('net worth', context)
    expect(netWorth).toContain('Net worth estimate')
    expect(netWorth).toContain('$1,200.00')

    const utilization = await chatWithAI('credit utilization', context)
    expect(utilization).toContain('Credit utilization')
    expect(utilization).toContain('$300.00')
    expect(utilization).toContain('$2,000.00')
  })

  it('answers largest expenses, donations, and upcoming subscriptions', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { chatWithAI } = await import('./local-ai')
    const context = {
      transactions: [
        {
          description: 'Vacation',
          amount: -600,
          type: 'EXPENSE',
          date: '2026-02-12',
        },
        {
          description: 'Charity donation',
          amount: -50,
          type: 'EXPENSE',
          date: '2026-02-11',
        },
      ],
      accounts: [],
      subscriptions: [
        {
          name: 'Streaming',
          amount: 15,
          billingCycle: 'MONTHLY',
          nextBillingDate: '2026-02-20',
        },
      ],
    }

    const largest = await chatWithAI('largest transactions over $400', context)
    expect(largest).toContain('Largest expenses')
    expect(largest).toContain('Vacation')
    expect(largest).toContain('$600.00')

    const donations = await chatWithAI('donations this month', context)
    expect(donations).toContain('Donations in the last 30 days')
    expect(donations).toContain('$50.00')

    const upcoming = await chatWithAI('upcoming subscriptions', context)
    expect(upcoming).toContain('Upcoming renewals')
    expect(upcoming).toContain('Streaming')
  })

  it('describes spending spikes with or without history', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { chatWithAI } = await import('./local-ai')
    const withHistory = await chatWithAI('spending spike', {
      transactions: [
        {
          description: 'Dining',
          amount: -200,
          type: 'EXPENSE',
          date: '2026-02-12',
        },
        {
          description: 'Groceries',
          amount: -100,
          type: 'EXPENSE',
          date: '2026-02-10',
        },
        {
          description: 'Utilities',
          amount: -50,
          type: 'EXPENSE',
          date: '2026-02-02',
        },
      ],
    })
    expect(withHistory).toContain('Spending trend')

    const withoutHistory = await chatWithAI('spending spike', {
      transactions: [
        {
          description: 'Groceries',
          amount: -100,
          type: 'EXPENSE',
          date: '2026-02-12',
        },
      ],
    })
    expect(withoutHistory).toContain('not enough prior spending history')
  })

  it('falls back to OpenRouter when no deterministic answer is found', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: { choices: [{ message: { content: 'Snapshot summary.' } }] },
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { chatWithAI } = await import('./local-ai')
    const response = await chatWithAI('What should I do next?', {
      transactions: [
        {
          description: 'Groceries',
          amount: -50,
          type: 'EXPENSE',
          date: '2026-02-10',
        },
      ],
      accounts: [{ id: 'chk', type: 'CHECKING', balance: 1200 }],
      subscriptions: [],
    })

    expect(response).toContain('Snapshot summary.')
    expect(response).toContain('Quick data snapshot:')
    expect(response).toContain('30-day spending: $50.00')
  })

  it('returns fallback chat responses on OpenRouter errors', async () => {
    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({
          ok: true,
          json: { choices: [{ message: { content: '   ' } }] },
        })
      )
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { chatWithAI } = await import('./local-ai')
    const empty = await chatWithAI('Need advice', {
      transactions: [
        {
          description: 'Groceries',
          amount: -40,
          type: 'EXPENSE',
          date: '2026-02-10',
        },
      ],
      accounts: [{ id: 'chk', type: 'CHECKING', balance: 800 }],
      subscriptions: [],
    })
    expect(empty).toContain('Quick data snapshot')

    const failure = await chatWithAI('Need advice', {
      transactions: [
        {
          description: 'Fuel',
          amount: -60,
          type: 'EXPENSE',
          date: '2026-02-11',
        },
      ],
      accounts: [{ id: 'chk', type: 'CHECKING', balance: 900 }],
      subscriptions: [],
    })
    expect(failure).toContain('Quick data snapshot')
  })

  it('generates financial insights and handles failures', async () => {
    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({
          ok: true,
          json: { choices: [{ message: { content: 'Save more.' } }] },
        })
      )
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { generateFinancialInsights } = await import('./local-ai')
    const first = await generateFinancialInsights(
      [
        {
          id: 't1',
          description: 'Coffee',
          amount: 5,
          date: new Date(),
          type: 'EXPENSE',
        },
      ],
      [],
      []
    )
    expect(first[0].description).toBe('Save more.')

    const fallback = await generateFinancialInsights([], [], [])
    expect(fallback[0].title).toBe('Spending Summary')
  })

  it('returns bulk categorization results even when a call fails', async () => {
    setEnv({ OPENROUTER_API_KEY: 'key', OPENROUTER_BASE_URL: 'https://api' })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        createFetchResponse({
          ok: true,
          json: { choices: [{ message: { content: 'Shopping' } }] },
        })
      )
    )

    const localAiModule = await import('./local-ai')
    const failingDescription = {
      toLowerCase: () => {
        throw new Error('fail')
      },
    }

    const results = await localAiModule.bulkCategorizeTransactions([
      {
        id: 't1',
        description: failingDescription as unknown as string,
        amount: 20,
      },
      { id: 't2', description: 'Walmart', amount: 50 },
    ])

    expect(results.t1.category).toBe('Other')
    expect(results.t2.category).toBe('Shopping')
  })

  it('handles deterministic spending edge cases', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { chatWithAI } = await import('./local-ai')
    const noExpenses = await chatWithAI('monthly spending', {
      transactions: [
        {
          description: 'Salary',
          amount: 500,
          type: 'INCOME',
          date: '2026-02-10',
        },
      ],
    })
    expect(noExpenses).toContain('do not see any expense transactions')

    const noCreditCards = await chatWithAI('credit card spending this month', {
      transactions: [
        {
          description: 'Groceries',
          amount: -50,
          type: 'EXPENSE',
          date: '2026-02-12',
          accountType: 'CHECKING',
        },
      ],
    })
    expect(noCreditCards).toContain('Credit cards: $0.00')
  })

  it('returns top categories summaries and cash empty states', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { chatWithAI } = await import('./local-ai')
    const topCategories = await chatWithAI('top categories', {
      transactions: [
        {
          description: 'Groceries',
          amount: -60,
          category: 'Food',
          type: 'EXPENSE',
          date: '2026-02-10',
        },
        {
          description: 'Gas',
          amount: -40,
          category: 'Transportation',
          type: 'EXPENSE',
          date: '2026-02-11',
        },
      ],
    })
    expect(topCategories).toContain('Top categories (last 30 days):')
    expect(topCategories).toContain('Food')

    const noCash = await chatWithAI('cash in checking', {
      accounts: [],
    })
    expect(noCash).toContain(
      'No checking or savings accounts are connected yet'
    )
  })

  it('summarizes subscriptions without upcoming dates', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { chatWithAI } = await import('./local-ai')
    const summary = await chatWithAI('subscriptions', {
      subscriptions: [
        {
          name: 'Service',
          amount: 20,
          billingCycle: 'MONTHLY',
          nextBillingDate: 'invalid-date',
        },
      ],
    })

    expect(summary).toContain('Estimated monthly subscriptions total')
    expect(summary).not.toContain('Upcoming:')
  })

  it('includes site metadata headers when configured', async () => {
    setEnv({
      OPENROUTER_API_KEY: 'key',
      OPENROUTER_BASE_URL: 'https://api',
      OPENROUTER_SITE_URL: 'https://site.test',
      OPENROUTER_SITE_NAME: 'Finance',
    })
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createFetchResponse({ ok: true, json: { data: [] } }))
    vi.stubGlobal('fetch', fetchMock)

    const { getAvailableModels } = await import('./local-ai')
    await getAvailableModels()

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api/models',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer key',
          'HTTP-Referer': 'https://site.test',
          'X-Title': 'Finance',
        }),
      })
    )
  })

  it('returns fallback chat responses without API keys', async () => {
    setEnv({ OPENROUTER_API_KEY: '' })
    const { chatWithAI } = await import('./local-ai')
    const response = await chatWithAI('Give me advice', {
      transactions: [
        {
          description: 'Groceries',
          amount: -20,
          type: 'EXPENSE',
          date: '2026-02-10',
        },
      ],
      accounts: [{ id: 'chk', type: 'CHECKING', balance: 400 }],
      subscriptions: [],
    })
    expect(response).toContain('Quick data snapshot')
  })
})
