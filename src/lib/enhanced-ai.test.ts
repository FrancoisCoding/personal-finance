import type { AutoCategorizationResult } from './enhanced-ai'

const originalEnv = { ...process.env }

const resetEnv = () => {
  process.env = { ...originalEnv }
}

describe('enhanced-ai', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    resetEnv()
    vi.resetModules()
  })

  it('auto-categorizes transactions with AI and fallbacks', async () => {
    const { autoCategorizeTransactions } = await import('./enhanced-ai')

    const results = await autoCategorizeTransactions([
      {
        id: 't-ai',
        description: 'Target store',
        amount: 20,
      },
      { id: 't-food', description: 'restaurant', amount: 12 },
      { id: 't-transport', description: 'uber', amount: 30 },
      { id: 't-shopping', description: 'walmart', amount: 45 },
      { id: 't-ent', description: 'netflix', amount: 15 },
      { id: 't-tech', description: 'sparkfun', amount: 100 },
      { id: 't-tech2', description: 'github subscription', amount: 80 },
      { id: 't-utils', description: 'electric bill', amount: 60 },
      { id: 't-health', description: 'doctor visit', amount: 50 },
      { id: 't-services', description: 'landscaping', amount: 70 },
      { id: 't-salary', description: 'payroll deposit', amount: 2000 },
      { id: 't-business', description: 'office supplies', amount: 90 },
      { id: 't-housing', description: 'rent payment', amount: 800 },
      { id: 't-education', description: 'tuition', amount: 500 },
      { id: 't-travel', description: 'flight ticket', amount: 300 },
      { id: 't-insurance', description: 'geico premium', amount: 120 },
      { id: 't-invest', description: 'fidelity investment', amount: 200 },
      { id: 't-freelance', description: 'freelance contract', amount: 400 },
      { id: 't-gifts', description: 'gift', amount: 25 },
      { id: 't-sub', description: 'membership renewal', amount: 10 },
      { id: 't-care', description: 'haircut', amount: 40 },
      { id: 't-fit', description: 'fitness class', amount: 30 },
      { id: 't-pet', description: 'petco', amount: 55 },
      { id: 't-charity', description: 'nonprofit support', amount: 20 },
      { id: 't-legal', description: 'legal fee', amount: 200 },
      { id: 't-tax', description: 'tax filing', amount: 150 },
      { id: 't-other', description: 'mystery', amount: 5 },
      { id: 't-skip', description: 'skip', amount: 1, category: 'Housing' },
    ])

    expect(results[0]).toMatchObject({
      transactionId: 't-ai',
      suggestedCategory: 'Shopping',
      confidence: 0.3,
    })
    const categories = results.map((result) => result.suggestedCategory)
    expect(categories).toContain('Food & Dining')
    expect(categories).toContain('Transportation')
    expect(categories).toContain('Entertainment')
    expect(categories).toContain('Technology')
    expect(categories).toContain('Utilities')
    expect(categories).toContain('Healthcare')
    expect(categories).toContain('Services')
    expect(categories).toContain('Salary')
    expect(categories).toContain('Business')
    expect(categories).toContain('Housing')
    expect(categories).toContain('Education')
    expect(categories).toContain('Travel')
    expect(categories).toContain('Insurance')
    expect(categories).toContain('Investment')
    expect(categories).toContain('Freelance')
    expect(categories).toContain('Gifts')
    expect(categories).toContain('Subscriptions')
    expect(categories).toContain('Personal Care')
    expect(categories).toContain('Fitness')
    expect(categories).toContain('Pets')
    expect(categories).toContain('Charity')
    expect(categories).toContain('Legal')
    expect(categories).toContain('Taxes')
    expect(categories).toContain('Other')
  })

  it('uses AI categorization results when available', async () => {
    process.env.OPENROUTER_API_KEY = 'key'
    process.env.OPENROUTER_BASE_URL = 'https://api'
    vi.resetModules()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Shopping' } }],
        }),
        status: 200,
        statusText: 'OK',
      })
    )

    const { autoCategorizeTransactions } = await import('./enhanced-ai')
    const results = await autoCategorizeTransactions([
      {
        id: 't-ai',
        description: 'Target store',
        amount: 20,
      },
    ])

    expect(results[0]).toMatchObject({
      transactionId: 't-ai',
      suggestedCategory: 'Shopping',
      confidence: 0.8,
    })
  })

  it('can reach the secondary services fallback branch', async () => {
    const { autoCategorizeTransactions } = await import('./enhanced-ai')

    const calls: string[] = []
    const probeDescription = {
      toLowerCase: () => ({
        includes: (value: string) => {
          calls.push(value)
          return false
        },
      }),
    }

    await autoCategorizeTransactions([
      {
        id: 'probe',
        description: probeDescription as unknown as string,
        amount: 1,
      },
    ])

    const targetIndex = calls.lastIndexOf('service')
    expect(targetIndex).toBeGreaterThan(-1)

    let count = 0
    const targetedDescription = {
      toLowerCase: () => ({
        includes: () => {
          const shouldMatch = count === targetIndex
          count += 1
          return shouldMatch
        },
      }),
    }

    const results = (await autoCategorizeTransactions([
      {
        id: 'secondary',
        description: targetedDescription as unknown as string,
        amount: 1,
      },
    ])) as AutoCategorizationResult[]

    expect(results[0].suggestedCategory).toBe('Services')
  })

  it('analyzes budget progress states', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { analyzeBudgetProgress } = await import('./enhanced-ai')
    const results = analyzeBudgetProgress(
      [
        { id: 'b1', name: 'Food', amount: 100, category: 'Food' },
        { id: 'b2', name: 'Travel', amount: 100, category: 'Travel' },
        { id: 'b3', name: 'Housing', amount: 200, category: 'Housing' },
      ],
      [
        {
          category: 'Food',
          date: '2026-02-10',
          amount: 120,
        },
        {
          category: 'Travel',
          date: '2026-02-12',
          amount: 85,
        },
        {
          category: 'Housing',
          date: '2026-02-11',
          amount: 50,
        },
      ]
    )

    expect(results.find((b) => b.budgetId === 'b1')?.status).toBe('over_budget')
    expect(results.find((b) => b.budgetId === 'b2')?.status).toBe('warning')
    expect(results.find((b) => b.budgetId === 'b3')?.status).toBe('on_track')
  })

  it('analyzes goal progress states', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { analyzeGoalProgress } = await import('./enhanced-ai')
    const results = analyzeGoalProgress(
      [
        {
          id: 'g1',
          name: 'Trip',
          targetAmount: 300,
          currentAmount: 0,
          createdAt: '2025-08-15',
        },
        {
          id: 'g2',
          name: 'Emergency',
          targetAmount: 100,
          currentAmount: 0,
          createdAt: '2025-08-15',
          targetDate: '2026-01-01',
        },
        {
          id: 'g3',
          name: 'New Car',
          targetAmount: 200,
          currentAmount: 0,
          createdAt: '2025-08-15',
        },
      ],
      [
        { type: 'INCOME', amount: 100 },
        { type: 'INCOME', amount: 0 },
      ]
    )

    expect(results.find((g) => g.goalId === 'g1')?.status).toBe('behind')
    expect(results.find((g) => g.goalId === 'g2')?.status).toBe('ahead')
    expect(results.find((g) => g.goalId === 'g2')?.projectedCompletion).toBe(
      'Target date passed'
    )
    expect(results.find((g) => g.goalId === 'g3')?.status).toBe('on_track')
  })

  it('detects spending trends by category', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { analyzeSpendingPatterns } = await import('./enhanced-ai')
    const results = analyzeSpendingPatterns([
      { category: 'Dining', amount: -200, date: '2026-02-10', type: 'EXPENSE' },
      { category: 'Dining', amount: -100, date: '2026-01-10', type: 'EXPENSE' },
      { category: 'Gas', amount: -50, date: '2026-02-11', type: 'EXPENSE' },
      { category: 'Gas', amount: -100, date: '2026-01-11', type: 'EXPENSE' },
      { category: 'Other', amount: -80, date: '2026-02-12', type: 'EXPENSE' },
    ])

    expect(results.find((r) => r.category === 'Dining')?.trend).toBe(
      'increasing'
    )
    expect(results.find((r) => r.category === 'Gas')?.trend).toBe('decreasing')
    expect(results.find((r) => r.category === 'Other')?.trend).toBe('stable')
  })

  it('generates enhanced insights', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { generateEnhancedInsights } = await import('./enhanced-ai')
    const insights = await generateEnhancedInsights(
      [
        {
          id: 't1',
          description: 'Rent',
          amount: -900,
          category: 'Housing',
          date: '2026-02-10',
          type: 'EXPENSE',
        },
        {
          id: 't2',
          description: 'Salary',
          amount: 1000,
          category: 'Salary',
          date: '2026-02-05',
          type: 'INCOME',
        },
      ],
      [
        { id: 'b1', name: 'Housing', amount: 800, category: 'Housing' },
        { id: 'b2', name: 'Food', amount: 100, category: 'Food' },
      ],
      [
        {
          id: 'g1',
          name: 'Vacation',
          targetAmount: 300,
          currentAmount: 0,
          createdAt: '2025-08-15',
        },
      ]
    )

    expect(insights.length).toBeGreaterThan(0)
    expect(insights.some((insight) => insight.type === 'budget_alert')).toBe(
      true
    )
    expect(insights.some((insight) => insight.type === 'goal_progress')).toBe(
      true
    )
    expect(
      insights.some((insight) => insight.type === 'spending_pattern')
    ).toBe(true)
    expect(
      insights.some((insight) => insight.type === 'savings_opportunity')
    ).toBe(true)
  })

  it('captures warning budgets and behind goals without extra insights', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))

    const { generateEnhancedInsights } = await import('./enhanced-ai')
    const insights = await generateEnhancedInsights(
      [
        {
          id: 't1',
          description: 'Food',
          amount: -85,
          category: 'Food',
          date: '2026-02-10',
          type: 'EXPENSE',
        },
        {
          id: 't2',
          description: 'Travel',
          amount: -85,
          category: 'Travel',
          date: '2026-02-11',
          type: 'EXPENSE',
        },
        {
          id: 't3',
          description: 'Utilities',
          amount: -85,
          category: 'Utilities',
          date: '2026-02-12',
          type: 'EXPENSE',
        },
        {
          id: 't4',
          description: 'Shopping',
          amount: -85,
          category: 'Shopping',
          date: '2026-02-13',
          type: 'EXPENSE',
        },
        {
          id: 't5',
          description: 'Salary',
          amount: 1000,
          category: 'Salary',
          date: '2026-02-05',
          type: 'INCOME',
        },
      ],
      [{ id: 'b1', name: 'Food', amount: 100, category: 'Food' }],
      [
        {
          id: 'g1',
          name: 'Emergency',
          targetAmount: 3000,
          currentAmount: 0,
          createdAt: '2025-08-15',
        },
      ]
    )

    expect(
      insights.some((insight) => insight.title.includes('Budget Warning'))
    ).toBe(true)
    expect(
      insights.some((insight) => insight.title.includes('Behind on Goal'))
    ).toBe(true)
    expect(
      insights.some((insight) => insight.type === 'spending_pattern')
    ).toBe(false)
    expect(
      insights.some((insight) => insight.type === 'savings_opportunity')
    ).toBe(false)
  })
})
