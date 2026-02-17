import {
  calculateBudgetForecastItems,
  type IBudgetForecastBudget,
  type IBudgetForecastTransaction,
} from './budget-forecast'

const fixedNow = new Date(2026, 1, 15, 12, 0, 0, 0)

describe('budget-forecast', () => {
  it('calculates monthly recurring forecast metrics', () => {
    const budgets: IBudgetForecastBudget[] = [
      {
        id: 'b1',
        name: 'Food',
        amount: 1000,
        period: 'MONTHLY',
        categoryId: 'cat-food',
        startDate: new Date(2026, 0, 1),
        isRecurring: true,
      },
    ]
    const transactions: IBudgetForecastTransaction[] = [
      {
        type: 'EXPENSE',
        amount: 300,
        categoryId: 'cat-food',
        date: new Date(2026, 1, 10),
      },
      {
        type: 'EXPENSE',
        amount: 100,
        categoryId: 'cat-food',
        date: new Date(2026, 1, 12),
      },
      {
        type: 'EXPENSE',
        amount: 100,
        categoryId: 'cat-food',
        date: new Date(2026, 2, 1),
      },
      {
        type: 'INCOME',
        amount: 5000,
        categoryId: 'cat-food',
        date: new Date(2026, 1, 11),
      },
    ]

    const [item] = calculateBudgetForecastItems({
      budgets,
      transactions,
      now: fixedNow,
    })

    expect(item.spentToDate).toBe(400)
    expect(item.projectedSpend).toBeCloseTo((400 / 15) * 28, 5)
    expect(item.projectedUtilization).toBeCloseTo(
      ((400 / 15) * 28 * 100) / 1000
    )
    expect(item.currentUtilization).toBe(40)
    expect(item.status).toBe('healthy')
    expect(item.daysUntilOverBudget).toBe(23)
    expect(item.daysRemainingInWindow).toBe(13)
    expect(item.recommendedDailyCap).toBeCloseTo(600 / 14)
    expect(item.likelyOverrunDate).toBeNull()
  })

  it('marks daily budget warning using current utilization threshold', () => {
    const budgets: IBudgetForecastBudget[] = [
      {
        id: 'b-warning',
        name: 'Daily',
        amount: 100,
        period: 'DAILY',
        isRecurring: true,
      },
    ]
    const transactions: IBudgetForecastTransaction[] = [
      { type: 'EXPENSE', amount: 80, date: new Date(2026, 1, 15, 8, 0, 0) },
    ]

    const [item] = calculateBudgetForecastItems({
      budgets,
      transactions,
      now: fixedNow,
    })

    expect(item.status).toBe('warning')
    expect(item.projectedUtilization).toBe(80)
    expect(item.daysRemainingInWindow).toBe(0)
    expect(item.recommendedDailyCap).toBe(0)
  })

  it('marks over-budget and computes overrun date when burn rate is unsustainable', () => {
    const budgets: IBudgetForecastBudget[] = [
      {
        id: 'b-over',
        name: 'Rent',
        amount: 100,
        period: 'MONTHLY',
        isRecurring: true,
      },
    ]
    const transactions: IBudgetForecastTransaction[] = [
      { type: 'EXPENSE', amount: 90, date: new Date(2026, 1, 10) },
    ]

    const [item] = calculateBudgetForecastItems({
      budgets,
      transactions,
      now: fixedNow,
    })

    expect(item.status).toBe('over')
    expect(item.daysUntilOverBudget).toBe(2)
    expect(item.likelyOverrunDate).not.toBeNull()
    expect(item.likelyOverrunDate?.toDateString()).toBe(
      new Date(2026, 1, 16).toDateString()
    )
  })

  it('uses explicit start and end dates for non-recurring budgets', () => {
    const budgets: IBudgetForecastBudget[] = [
      {
        id: 'b-non-recurring',
        name: 'One-time Event',
        amount: 100,
        period: 'MONTHLY',
        startDate: new Date(2026, 1, 10),
        endDate: new Date(2026, 1, 20),
        isRecurring: false,
      },
    ]
    const transactions: IBudgetForecastTransaction[] = [
      { type: 'EXPENSE', amount: 90, date: new Date(2026, 1, 5) },
      { type: 'EXPENSE', amount: 40, date: new Date(2026, 1, 12) },
    ]

    const [item] = calculateBudgetForecastItems({
      budgets,
      transactions,
      now: fixedNow,
    })

    expect(item.spentToDate).toBe(40)
    expect(item.projectedSpend).toBeCloseTo((40 / 6) * 11, 5)
    expect(item.status).toBe('healthy')
  })

  it('handles non-recurring windows with missing or invalid end date', () => {
    const budgets: IBudgetForecastBudget[] = [
      {
        id: 'b-fallback-end',
        name: 'Weekly Sprint',
        amount: 140,
        period: 'WEEKLY',
        startDate: new Date(2026, 1, 14),
        isRecurring: false,
      },
      {
        id: 'b-invalid-range',
        name: 'Invalid Range',
        amount: 100,
        period: 'DAILY',
        startDate: new Date(2026, 1, 15),
        endDate: new Date(2026, 1, 14),
        isRecurring: false,
      },
    ]
    const transactions: IBudgetForecastTransaction[] = [
      { type: 'EXPENSE', amount: 20, date: new Date(2026, 1, 14) },
      { type: 'EXPENSE', amount: 30, date: new Date(2026, 1, 15) },
      { type: 'EXPENSE', amount: 50, date: new Date(2026, 1, 18) },
    ]

    const [first, second] = calculateBudgetForecastItems({
      budgets,
      transactions,
      now: fixedNow,
    })

    expect(first.id).toBe('b-fallback-end')
    expect(first.spentToDate).toBe(50)
    expect(first.daysRemainingInWindow).toBe(5)
    expect(second.id).toBe('b-invalid-range')
    expect(second.spentToDate).toBe(30)
  })

  it('matches categories through relation, lookup fallback, and raw category name', () => {
    const budgets: IBudgetForecastBudget[] = [
      {
        id: 'b-category-name',
        name: 'Groceries',
        amount: 500,
        period: 'MONTHLY',
        category: { name: 'Groceries' },
        isRecurring: true,
      },
    ]
    const transactions: IBudgetForecastTransaction[] = [
      {
        type: 'EXPENSE',
        amount: 50,
        categoryRelation: { name: 'Groceries' },
        date: new Date(2026, 1, 5),
      },
      {
        type: 'EXPENSE',
        amount: 25,
        categoryId: 'cat-groceries',
        date: new Date(2026, 1, 6),
      },
      {
        type: 'EXPENSE',
        amount: 15,
        category: 'Groceries',
        date: new Date(2026, 1, 7),
      },
    ]
    const categoryLookup = new Map([['cat-groceries', 'Groceries']])

    const [item] = calculateBudgetForecastItems({
      budgets,
      transactions,
      categoryLookup,
      now: fixedNow,
    })

    expect(item.spentToDate).toBe(90)
  })

  it('returns null daysUntilOverBudget when no expenses and ignores invalid transaction dates', () => {
    const budgets: IBudgetForecastBudget[] = [
      {
        id: 'b-clean',
        name: 'Utilities',
        amount: 200,
        period: 'MONTHLY',
        isRecurring: true,
      },
    ]
    const transactions: IBudgetForecastTransaction[] = [
      { type: 'EXPENSE', amount: 100, date: 'not-a-date' },
      { type: 'TRANSFER', amount: 60, date: new Date(2026, 1, 10) },
    ]

    const [item] = calculateBudgetForecastItems({
      budgets,
      transactions,
      now: fixedNow,
    })

    expect(item.spentToDate).toBe(0)
    expect(item.daysUntilOverBudget).toBeNull()
    expect(item.status).toBe('healthy')
  })

  it('sorts by risk and utilization, applies limit, and clamps recurring window to start/end', () => {
    const budgets: IBudgetForecastBudget[] = [
      {
        id: 'b-over',
        name: 'Over',
        amount: 100,
        period: 'MONTHLY',
        categoryId: 'cat-over',
        isRecurring: true,
      },
      {
        id: 'b-warning',
        name: 'Warning',
        amount: 100,
        period: 'DAILY',
        categoryId: 'cat-warning',
        isRecurring: true,
      },
      {
        id: 'b-healthy',
        name: 'Healthy',
        amount: 1000,
        period: 'YEARLY',
        categoryId: 'cat-healthy',
        startDate: new Date(2026, 1, 10),
        endDate: new Date(2026, 1, 20),
        isRecurring: true,
      },
    ]
    const transactions: IBudgetForecastTransaction[] = [
      {
        type: 'EXPENSE',
        amount: 90,
        categoryId: 'cat-over',
        date: new Date(2026, 1, 10),
      },
      {
        type: 'EXPENSE',
        amount: 80,
        categoryId: 'cat-warning',
        date: new Date(2026, 1, 15),
      },
      {
        type: 'EXPENSE',
        amount: 40,
        categoryId: 'cat-healthy',
        date: new Date(2026, 1, 12),
      },
      {
        type: 'EXPENSE',
        amount: 40,
        categoryId: 'cat-healthy',
        date: new Date(2026, 1, 1),
      },
      {
        type: 'EXPENSE',
        amount: 40,
        categoryId: 'cat-healthy',
        date: new Date(2026, 1, 25),
      },
    ]

    const items = calculateBudgetForecastItems({
      budgets,
      transactions,
      now: fixedNow,
      limit: 2,
    })

    expect(items).toHaveLength(2)
    expect(items[0].id).toBe('b-over')
    expect(items[1].id).toBe('b-warning')

    const unclampedItems = calculateBudgetForecastItems({
      budgets,
      transactions,
      now: fixedNow,
    })
    const healthyItem = unclampedItems.find((item) => item.id === 'b-healthy')

    expect(healthyItem?.spentToDate).toBe(40)
    expect(healthyItem?.daysRemainingInWindow).toBe(5)
  })
})
