import { AccountType } from '@prisma/client'

const tellerFetchMock = vi.fn()
const upsertMock = vi.fn()
const findFirstMock = vi.fn()
const createMock = vi.fn()

vi.mock('@/lib/teller', () => ({
  tellerFetch: (...args: unknown[]) => tellerFetchMock(...args),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    financialAccount: {
      upsert: (...args: unknown[]) => upsertMock(...args),
    },
    transaction: {
      findFirst: (...args: unknown[]) => findFirstMock(...args),
      create: (...args: unknown[]) => createMock(...args),
    },
  },
}))

describe('teller sync', () => {
  beforeEach(() => {
    tellerFetchMock.mockReset()
    upsertMock.mockReset()
    findFirstMock.mockReset()
    createMock.mockReset()
  })

  it('syncs accounts and transactions from Teller', async () => {
    const accounts = [
      {
        id: 'acc1',
        name: 'Checking',
        type: 'depository',
        subtype: 'checking',
        currency: 'USD',
        last_four: '1234',
        institution: { name: 'Bank' },
      },
      {
        id: 'acc2',
        name: 'Savings',
        type: 'depository',
        subtype: 'savings',
      },
      { id: 'acc3', name: 'Credit', type: 'credit' },
      { id: 'acc4', name: 'Invest', type: 'investment' },
      { id: 'acc5', name: 'Loan', type: 'loan' },
      { id: 'acc6', name: 'Other', type: 'other' },
      {
        id: 'acc7',
        name: 'Money Market',
        type: 'depository',
        subtype: 'money_market',
      },
    ]

    const balanceMap: Record<
      string,
      { available: string | null; ledger: string | null }
    > = {
      acc1: { available: '100', ledger: null },
      acc2: { available: null, ledger: '200' },
      acc3: { available: null, ledger: null },
      acc4: { available: '50', ledger: null },
      acc5: { available: '75', ledger: null },
      acc6: { available: null, ledger: null },
      acc7: { available: null, ledger: 'invalid' },
    }

    const transactionsMap: Record<string, Array<Record<string, unknown>>> = {
      acc1: [
        {
          id: 'txn-new',
          amount: '-10',
          date: '2026-02-01',
          description: 'Coffee',
        },
        {
          id: 'txn-existing',
          amount: '20',
          date: '2026-02-02',
          details: { description: 'Pay' },
        },
        {
          id: 'txn-income',
          amount: '30',
          date: '2026-02-03',
          description: 'Interest',
        },
      ],
      acc2: [
        {
          id: 'txn-fallback',
          amount: '-5',
          date: '2026-02-03',
        },
        {
          id: 'txn-nan',
          amount: 'invalid',
          date: '2026-02-04',
        },
      ],
      acc3: [],
      acc4: [],
      acc5: [],
      acc6: [],
      acc7: [],
    }

    tellerFetchMock.mockImplementation(async (path: string) => {
      if (path === '/accounts') return accounts
      if (path.includes('/balances')) {
        const accountId = path.split('/')[2]
        return balanceMap[accountId]
      }
      if (path.includes('/transactions')) {
        const accountId = path.split('/')[2]
        return transactionsMap[accountId] ?? []
      }
      return []
    })

    upsertMock.mockImplementation(
      async ({ create }: { create: { tellerAccountId: string } }) => ({
        id: `db-${create.tellerAccountId}`,
      })
    )

    findFirstMock.mockImplementation(
      async ({ where }: { where: { tellerTransactionId: string } }) =>
        where.tellerTransactionId === 'txn-existing' ? { id: 'existing' } : null
    )

    const { syncTellerEnrollment } = await import('./teller-sync')
    const result = await syncTellerEnrollment({
      userId: 'user-1',
      accessToken: 'token',
    })

    expect(result.accountsSynced).toBe(accounts.length)
    expect(result.transactionsSynced).toBe(4)

    const mappedTypes = upsertMock.mock.calls.map((call) => call[0].update.type)
    expect(mappedTypes).toContain(AccountType.CHECKING)
    expect(mappedTypes).toContain(AccountType.SAVINGS)
    expect(mappedTypes).toContain(AccountType.CREDIT_CARD)
    expect(mappedTypes).toContain(AccountType.INVESTMENT)
    expect(mappedTypes).toContain(AccountType.LOAN)
    expect(mappedTypes).toContain(AccountType.OTHER)

    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 10,
          description: 'Coffee',
          type: 'EXPENSE',
        }),
      })
    )
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 5,
          description: 'Teller transaction',
        }),
      })
    )
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 30,
          type: 'INCOME',
        }),
      })
    )
    expect(createMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 0,
        }),
      })
    )
  })

  it('skips existing transactions and maps savings accounts', async () => {
    const accounts = [
      {
        id: 'acc-savings',
        name: 'Savings',
        type: 'depository',
        subtype: 'savings',
      },
    ]

    tellerFetchMock.mockImplementation(async (path: string) => {
      if (path === '/accounts') return accounts
      if (path.includes('/balances')) return { available: '50', ledger: null }
      if (path.includes('/transactions')) {
        return [
          {
            id: 'txn-existing',
            amount: '-25',
            date: '2026-02-05',
            description: 'Existing',
          },
        ]
      }
      return []
    })

    upsertMock.mockResolvedValue({ id: 'db-acc-savings' })
    findFirstMock.mockResolvedValue({ id: 'existing' })

    const { syncTellerEnrollment } = await import('./teller-sync')
    const result = await syncTellerEnrollment({
      userId: 'user-2',
      accessToken: 'token',
    })

    expect(result.accountsSynced).toBe(1)
    expect(result.transactionsSynced).toBe(0)
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ type: AccountType.SAVINGS }),
      })
    )
    expect(createMock).not.toHaveBeenCalled()
  })
})
