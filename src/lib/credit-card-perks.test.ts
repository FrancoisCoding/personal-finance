import { analyzeCreditCardPerks } from '@/lib/credit-card-perks'

describe('credit card perks analysis', () => {
  it('tracks used and unused monthly credits for Amex Gold', () => {
    const result = analyzeCreditCardPerks({
      now: new Date('2026-02-24T12:00:00.000Z'),
      accounts: [
        {
          id: 'card-amex',
          name: 'American Express Gold',
          type: 'CREDIT_CARD',
        },
      ],
      transactions: [
        {
          id: 'txn-uber',
          accountId: 'card-amex',
          description: 'Uber Eats',
          amount: 15,
          date: '2026-02-05T12:00:00.000Z',
          type: 'EXPENSE',
        },
        {
          id: 'txn-shake',
          accountId: 'card-amex',
          description: 'Shake Shack',
          amount: 4,
          date: '2026-02-10T12:00:00.000Z',
          type: 'EXPENSE',
        },
      ],
    })

    expect(result.trackedCardCount).toBe(1)
    expect(result.trackedPerkCount).toBe(3)
    expect(result.totalMonthlyValue).toBe(27)
    expect(result.redeemedMonthlyValue).toBe(14)
    expect(result.remainingMonthlyValue).toBe(13)

    const card = result.cards[0]
    const uberPerk = card.perks.find((perk) => perk.id === 'uber-credit')
    const diningPerk = card.perks.find((perk) => perk.id === 'dining-credit')
    const dunkinPerk = card.perks.find((perk) => perk.id === 'dunkin-credit')

    expect(uberPerk?.status).toBe('used')
    expect(uberPerk?.redeemedAmount).toBe(10)
    expect(diningPerk?.status).toBe('partial')
    expect(diningPerk?.redeemedAmount).toBe(4)
    expect(diningPerk?.remainingAmount).toBe(6)
    expect(dunkinPerk?.status).toBe('unused')
  })

  it('flags unused perks expiring soon near month end', () => {
    const result = analyzeCreditCardPerks({
      now: new Date('2026-02-27T12:00:00.000Z'),
      accounts: [
        {
          id: 'card-amex',
          name: 'Amex Gold',
          type: 'CREDIT_CARD',
        },
      ],
      transactions: [],
      expiryWarningDays: 5,
    })

    expect(result.expiringSoonCount).toBe(3)
    expect(result.cards[0]?.perks.every((perk) => perk.isExpiringSoon)).toBe(
      true
    )
  })

  it('ignores cards without supported perk programs', () => {
    const result = analyzeCreditCardPerks({
      now: new Date('2026-02-24T12:00:00.000Z'),
      accounts: [
        {
          id: 'card-visa',
          name: 'Visa Signature',
          type: 'CREDIT_CARD',
        },
      ],
      transactions: [],
    })

    expect(result.trackedCardCount).toBe(0)
    expect(result.cards).toHaveLength(0)
  })
})
