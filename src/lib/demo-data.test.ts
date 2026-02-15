import { buildDemoData } from './demo-data'

describe('demo data', () => {
  it('builds a complete demo dataset', () => {
    const data = buildDemoData()

    expect(data.accounts).toHaveLength(4)
    expect(data.categories.length).toBeGreaterThan(5)
    expect(data.transactions.length).toBeGreaterThan(10)
    expect(data.budgets.length).toBeGreaterThan(1)
    expect(data.goals.length).toBeGreaterThan(0)
    expect(data.subscriptions.length).toBeGreaterThan(0)
    expect(data.creditCards.length).toBeGreaterThan(0)
  })

  it('includes donation and subscription activity', () => {
    const { transactions } = buildDemoData()

    const hasDonations = transactions.some((transaction) =>
      transaction.description.toLowerCase().includes('donation')
    )
    const hasSubscriptions = transactions.some(
      (transaction) => transaction.category === 'Subscriptions'
    )

    expect(hasDonations).toBe(true)
    expect(hasSubscriptions).toBe(true)
  })
})
