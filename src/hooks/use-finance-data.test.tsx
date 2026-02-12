import { act, renderHook, waitFor } from '@testing-library/react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'

import { createFetchResponse } from '../../tests/test-utils'

const toastSpy = vi.fn()
const defaultSession = { user: { id: 'user-1', name: 'Test User' } }

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: toastSpy }),
}))

const loadHooks = async () => import('./use-finance-data')

const createQueryWrapper = (session = defaultSession) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  )

  return { wrapper, queryClient }
}

describe('use-finance-data hooks', () => {
  beforeEach(() => {
    toastSpy.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
    vi.resetModules()
  })

  it('fetches accounts when a session is available', async () => {
    const { useAccounts } = await loadHooks()
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: [
          {
            id: 'acc1',
            userId: 'user-1',
            name: 'Checking',
            type: 'CHECKING',
            balance: 100,
            currency: 'USD',
            isActive: true,
          },
        ],
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.[0].name).toBe('Checking')
  })

  it('reports query errors when fetches fail', async () => {
    const { useTransactions } = await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useTransactions(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })

  it('computes monthly stats from transactions', async () => {
    const now = new Date()
    const currentMonthDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      5
    ).toISOString()
    const currentMonthExpenseDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      10
    ).toISOString()
    const previousMonthDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    ).toISOString()

    const { useMonthlyStats } = await loadHooks()
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: [
          {
            id: 't1',
            userId: 'user-1',
            accountId: 'acc1',
            amount: 500,
            description: 'Salary',
            date: currentMonthDate,
            type: 'INCOME',
            isRecurring: false,
            tags: [],
          },
          {
            id: 't2',
            userId: 'user-1',
            accountId: 'acc1',
            amount: 200,
            description: 'Groceries',
            date: currentMonthExpenseDate,
            type: 'EXPENSE',
            isRecurring: false,
            tags: [],
          },
          {
            id: 't3',
            userId: 'user-1',
            accountId: 'acc1',
            amount: 100,
            description: 'Old',
            date: previousMonthDate,
            type: 'EXPENSE',
            isRecurring: false,
            tags: [],
          },
        ],
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useMonthlyStats(), { wrapper })

    await waitFor(() => {
      expect(result.current.transactionCount).toBe(3)
    })

    expect(result.current.monthlyIncome).toBe(500)
    expect(result.current.monthlyExpenses).toBe(200)
    expect(result.current.netIncome).toBe(300)
  })

  it('calculates balances and credit utilization', async () => {
    const { useTotalBalance, useCreditCardUtilization } = await loadHooks()
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: [
          {
            id: 'acc1',
            userId: 'user-1',
            name: 'Checking',
            type: 'CHECKING',
            balance: 200,
            currency: 'USD',
            isActive: true,
          },
          {
            id: 'acc2',
            userId: 'user-1',
            name: 'Card',
            type: 'CREDIT_CARD',
            balance: -100,
            creditLimit: 500,
            currency: 'USD',
            isActive: true,
          },
        ],
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result: totalBalance } = renderHook(() => useTotalBalance(), {
      wrapper,
    })
    const { result: utilization } = renderHook(
      () => useCreditCardUtilization(),
      { wrapper }
    )

    await waitFor(() => {
      expect(utilization.current.totalLimit).toBe(500)
    })

    expect(totalBalance.current).toBe(100)
    expect(utilization.current.utilization).toBe(20)
  })

  it('returns zero utilization when there are no credit cards', async () => {
    const { useCreditCardUtilization } = await loadHooks()
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: [
          {
            id: 'acc1',
            userId: 'user-1',
            name: 'Checking',
            type: 'CHECKING',
            balance: 200,
            currency: 'USD',
            isActive: true,
          },
        ],
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useCreditCardUtilization(), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.totalLimit).toBe(0)
    })
  })

  it('calculates budget and goal progress', async () => {
    const { queryKeys, useBudgetProgress, useGoalProgress } = await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createFetchResponse({ ok: true, json: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, queryClient } = createQueryWrapper()
    queryClient.setQueryData(queryKeys.budgets, [
      {
        id: 'budget-1',
        userId: 'user-1',
        name: 'Groceries',
        amount: 100,
        period: 'MONTHLY',
        startDate: new Date('2026-02-01'),
        isActive: true,
        isRecurring: true,
        categoryId: 'cat1',
      },
    ])
    queryClient.setQueryData(queryKeys.transactions, [
      {
        id: 'txn-1',
        userId: 'user-1',
        accountId: 'acc1',
        amount: 50,
        description: 'Groceries',
        date: new Date('2026-02-10'),
        type: 'EXPENSE',
        isRecurring: false,
        tags: [],
        categoryId: 'cat1',
      },
    ])
    queryClient.setQueryData(queryKeys.goals, [
      {
        id: 'goal-1',
        userId: 'user-1',
        name: 'Goal',
        targetAmount: 200,
        currentAmount: 50,
        color: '#000',
        isCompleted: false,
      },
    ])

    const { result: budgetProgress } = renderHook(
      () => useBudgetProgress('budget-1'),
      { wrapper }
    )
    const { result: goalProgress } = renderHook(
      () => useGoalProgress('goal-1'),
      { wrapper }
    )
    const { result: missingBudget } = renderHook(
      () => useBudgetProgress('missing'),
      { wrapper }
    )
    const { result: missingGoal } = renderHook(
      () => useGoalProgress('missing'),
      { wrapper }
    )

    await waitFor(() => {
      expect(budgetProgress.current).toBeGreaterThan(0)
    })
    expect(goalProgress.current).toBe(25)
    expect(missingBudget.current).toBe(0)
    expect(missingGoal.current).toBe(0)
  })

  it('handles account, transaction, and sync mutations', async () => {
    const {
      useCreateTransaction,
      useUpdateTransaction,
      useCreateAccount,
      useDeleteAccount,
      useDeleteAllAccounts,
      useSyncTransactions,
    } = await loadHooks()

    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: { transactionsSynced: 2 },
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, queryClient } = createQueryWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result: createTransaction } = renderHook(
      () => useCreateTransaction(),
      { wrapper }
    )
    await act(async () => {
      await createTransaction.current.mutateAsync({
        accountId: 'acc1',
        amount: 10,
        description: 'Coffee',
        date: new Date(),
        type: 'EXPENSE',
        isRecurring: false,
        tags: [],
      })
    })
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Transaction created' })
    )

    const { result: updateTransaction } = renderHook(
      () => useUpdateTransaction(),
      { wrapper }
    )
    await act(async () => {
      await updateTransaction.current.mutateAsync({
        id: 'txn',
        updates: { description: 'Updated' },
      })
    })

    const { result: createAccount } = renderHook(() => useCreateAccount(), {
      wrapper,
    })
    await act(async () => {
      await createAccount.current.mutateAsync({
        name: 'New Account',
        type: 'CHECKING',
        balance: 0,
        currency: 'USD',
        isActive: true,
      })
    })

    const { result: deleteAccount } = renderHook(() => useDeleteAccount(), {
      wrapper,
    })
    await act(async () => {
      await deleteAccount.current.mutateAsync('acc1')
    })

    const { result: deleteAllAccounts } = renderHook(
      () => useDeleteAllAccounts(),
      { wrapper }
    )
    await act(async () => {
      await deleteAllAccounts.current.mutateAsync()
    })

    const { result: syncTransactions } = renderHook(
      () => useSyncTransactions(),
      { wrapper }
    )
    await act(async () => {
      await syncTransactions.current.mutateAsync()
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('surfaces mutation errors via toasts', async () => {
    const { useCreateTransaction, useCreateAccount, useSyncTransactions } =
      await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()

    const { result: createTransaction } = renderHook(
      () => useCreateTransaction(),
      { wrapper }
    )
    await expect(
      createTransaction.current.mutateAsync({
        accountId: 'acc1',
        amount: 10,
        description: 'Coffee',
        date: new Date(),
        type: 'EXPENSE',
        isRecurring: false,
        tags: [],
      })
    ).rejects.toThrow()

    const { result: createAccount } = renderHook(() => useCreateAccount(), {
      wrapper,
    })
    await expect(
      createAccount.current.mutateAsync({
        name: 'New Account',
        type: 'CHECKING',
        balance: 0,
        currency: 'USD',
        isActive: true,
      })
    ).rejects.toThrow()

    const { result: syncTransactions } = renderHook(
      () => useSyncTransactions(),
      { wrapper }
    )
    await expect(syncTransactions.current.mutateAsync()).rejects.toThrow()

    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    )
  })

  it('uses fallback error descriptions when error messages are missing', async () => {
    const {
      useCreateTransaction,
      useCreateAccount,
      useSyncTransactions,
      useDeleteAccount,
      useDeleteAllAccounts,
      useCreateGoal,
      useCreateBudget,
      useCreateSubscription,
      useUpdateSubscription,
      useDeleteSubscription,
      useUpdateTransaction,
      useSeedCategories,
    } = await loadHooks()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()

    const scenarios = [
      {
        hook: useCreateTransaction,
        args: {
          accountId: 'acc1',
          amount: 10,
          description: 'Coffee',
          date: new Date(),
          type: 'EXPENSE',
          isRecurring: false,
          tags: [],
        },
        description: 'Failed to create transaction',
      },
      {
        hook: useCreateAccount,
        args: {
          name: 'New Account',
          type: 'CHECKING',
          balance: 0,
          currency: 'USD',
          isActive: true,
        },
        description: 'Failed to create account',
      },
      {
        hook: useSyncTransactions,
        args: undefined,
        description: 'Failed to sync transactions',
      },
      {
        hook: useDeleteAccount,
        args: 'acc1',
        description: 'Failed to delete account',
      },
      {
        hook: useDeleteAllAccounts,
        args: undefined,
        description: 'Failed to delete all accounts',
      },
      {
        hook: useCreateGoal,
        args: {
          name: 'Goal',
          targetAmount: 100,
          targetDate: new Date(),
          color: '#000',
        },
        description: 'Failed to create goal',
      },
      {
        hook: useCreateBudget,
        args: {
          name: 'Budget',
          amount: 100,
          period: 'MONTHLY',
          startDate: new Date(),
          isRecurring: true,
        },
        description: 'Failed to create budget',
      },
      {
        hook: useCreateSubscription,
        args: {
          name: 'Service',
          amount: 15,
          billingCycle: 'MONTHLY',
          nextBillingDate: new Date(),
        },
        description: 'Failed to create subscription',
      },
      {
        hook: useUpdateSubscription,
        args: {
          id: 'sub1',
          updates: { notes: 'Updated' },
        },
        description: 'Failed to update subscription',
      },
      {
        hook: useDeleteSubscription,
        args: 'sub1',
        description: 'Failed to delete subscription',
      },
      {
        hook: useUpdateTransaction,
        args: {
          id: 'txn',
          updates: { description: 'Updated' },
        },
        description: 'Failed to update transaction',
      },
      {
        hook: useSeedCategories,
        args: undefined,
        description: 'Failed to seed categories',
      },
    ]

    for (const scenario of scenarios) {
      fetchMock.mockRejectedValueOnce({})
      const { result } = renderHook(() => scenario.hook(), { wrapper })

      if (scenario.args === undefined) {
        await expect(result.current.mutateAsync()).rejects.toBeDefined()
      } else {
        await expect(
          result.current.mutateAsync(scenario.args)
        ).rejects.toBeDefined()
      }

      expect(toastSpy).toHaveBeenCalledWith(
        expect.objectContaining({ description: scenario.description })
      )
    }
  })

  it('handles goal, budget, and subscription mutations', async () => {
    const {
      useCreateGoal,
      useCreateBudget,
      useCreateSubscription,
      useUpdateSubscription,
      useDeleteSubscription,
    } = await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createFetchResponse({ ok: true, json: {} }))
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, queryClient } = createQueryWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result: createGoal } = renderHook(() => useCreateGoal(), {
      wrapper,
    })
    await act(async () => {
      await createGoal.current.mutateAsync({
        name: 'Goal',
        targetAmount: 100,
        targetDate: new Date(),
        color: '#000',
      })
    })

    const { result: createBudget } = renderHook(() => useCreateBudget(), {
      wrapper,
    })
    await act(async () => {
      await createBudget.current.mutateAsync({
        name: 'Budget',
        amount: 100,
        period: 'MONTHLY',
        startDate: new Date(),
        isRecurring: true,
      })
    })

    const { result: createSubscription } = renderHook(
      () => useCreateSubscription(),
      { wrapper }
    )
    await act(async () => {
      await createSubscription.current.mutateAsync({
        name: 'Service',
        amount: 15,
        billingCycle: 'MONTHLY',
        nextBillingDate: new Date(),
      })
    })

    const { result: updateSubscription } = renderHook(
      () => useUpdateSubscription(),
      { wrapper }
    )
    await act(async () => {
      await updateSubscription.current.mutateAsync({
        id: 'sub1',
        updates: { notes: 'Updated' },
      })
    })

    const { result: deleteSubscription } = renderHook(
      () => useDeleteSubscription(),
      { wrapper }
    )
    await act(async () => {
      await deleteSubscription.current.mutateAsync('sub1')
    })

    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('handles mutation failures for goals and subscriptions', async () => {
    const {
      useCreateGoal,
      useCreateSubscription,
      useUpdateSubscription,
      useDeleteSubscription,
    } = await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()

    const { result: createGoal } = renderHook(() => useCreateGoal(), {
      wrapper,
    })
    await expect(
      createGoal.current.mutateAsync({
        name: 'Goal',
        targetAmount: 100,
        targetDate: new Date(),
        color: '#000',
      })
    ).rejects.toThrow()

    const { result: createSubscription } = renderHook(
      () => useCreateSubscription(),
      { wrapper }
    )
    await expect(
      createSubscription.current.mutateAsync({
        name: 'Service',
        amount: 15,
        billingCycle: 'MONTHLY',
        nextBillingDate: new Date(),
      })
    ).rejects.toThrow()

    const { result: updateSubscription } = renderHook(
      () => useUpdateSubscription(),
      { wrapper }
    )
    await expect(
      updateSubscription.current.mutateAsync({
        id: 'sub1',
        updates: { notes: 'Updated' },
      })
    ).rejects.toThrow()

    const { result: deleteSubscription } = renderHook(
      () => useDeleteSubscription(),
      { wrapper }
    )
    await expect(
      deleteSubscription.current.mutateAsync('sub1')
    ).rejects.toThrow()
  })

  it('handles additional mutation errors for budgets and accounts', async () => {
    const {
      useCreateBudget,
      useDeleteAccount,
      useDeleteAllAccounts,
      useUpdateTransaction,
    } = await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()

    const { result: createBudget } = renderHook(() => useCreateBudget(), {
      wrapper,
    })
    await expect(
      createBudget.current.mutateAsync({
        name: 'Budget',
        amount: 100,
        period: 'MONTHLY',
        startDate: new Date(),
        isRecurring: true,
      })
    ).rejects.toThrow()

    const { result: deleteAccount } = renderHook(() => useDeleteAccount(), {
      wrapper,
    })
    await expect(deleteAccount.current.mutateAsync('acc1')).rejects.toThrow()

    const { result: deleteAllAccounts } = renderHook(
      () => useDeleteAllAccounts(),
      { wrapper }
    )
    await expect(deleteAllAccounts.current.mutateAsync()).rejects.toThrow()

    const { result: updateTransaction } = renderHook(
      () => useUpdateTransaction(),
      { wrapper }
    )
    await expect(
      updateTransaction.current.mutateAsync({
        id: 'txn',
        updates: { description: 'Updated' },
      })
    ).rejects.toThrow()
  })

  it('seeds categories and fetches credit cards', async () => {
    const { queryKeys, useSeedCategories, useCreditCards } = await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createFetchResponse({ ok: true, json: [] }))
      .mockResolvedValueOnce(
        createFetchResponse({ ok: true, json: [{ id: 'cc1' }] })
      )
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, queryClient } = createQueryWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

    const { result: seedCategories } = renderHook(() => useSeedCategories(), {
      wrapper,
    })
    await act(async () => {
      await seedCategories.current.mutateAsync()
    })
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: queryKeys.categories })
    )

    const { result: creditCards } = renderHook(() => useCreditCards(), {
      wrapper,
    })
    await waitFor(() => {
      expect(creditCards.current.data).toEqual([{ id: 'cc1' }])
    })

    const { result: seedError } = renderHook(() => useSeedCategories(), {
      wrapper,
    })
    await expect(seedError.current.mutateAsync()).rejects.toThrow()
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' })
    )
  })

  it('reports credit card fetch failures', async () => {
    const { useCreditCards } = await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useCreditCards(), { wrapper })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })

  it('fetches credit cards through the query function', async () => {
    const { useCreditCards } = await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        createFetchResponse({ ok: true, json: [{ id: 'cc2' }] })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useCreditCards(), { wrapper })

    await waitFor(() => {
      expect(result.current.data).toEqual([{ id: 'cc2' }])
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/credit-cards')
  })

  it('exposes budgets, goals, categories, and subscriptions', async () => {
    const { useBudgets, useGoals, useCategories, useSubscriptions } =
      await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createFetchResponse({ ok: true, json: [] }))
      .mockResolvedValueOnce(createFetchResponse({ ok: true, json: [] }))
      .mockResolvedValueOnce(createFetchResponse({ ok: true, json: [] }))
      .mockResolvedValueOnce(createFetchResponse({ ok: true, json: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result: budgets } = renderHook(() => useBudgets(), { wrapper })
    const { result: goals } = renderHook(() => useGoals(), { wrapper })
    const { result: categories } = renderHook(() => useCategories(), {
      wrapper,
    })
    const { result: subscriptions } = renderHook(() => useSubscriptions(), {
      wrapper,
    })

    await waitFor(() => {
      expect(budgets.current.isSuccess).toBe(true)
    })
    expect(goals.current.data).toEqual([])
    expect(categories.current.data).toEqual([])
    expect(subscriptions.current.data).toEqual([])
  })

  it('skips queries when there is no active session', async () => {
    const { useAccounts } = await loadHooks()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper(null)
    const { result } = renderHook(() => useAccounts(), { wrapper })

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle')
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('skips all account and category queries without a session', async () => {
    const {
      useAccounts,
      useTransactions,
      useBudgets,
      useGoals,
      useCategories,
      useSubscriptions,
    } = await loadHooks()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper(null)
    const { result: accounts } = renderHook(() => useAccounts(), { wrapper })
    const { result: transactions } = renderHook(() => useTransactions(), {
      wrapper,
    })
    const { result: budgets } = renderHook(() => useBudgets(), { wrapper })
    const { result: goals } = renderHook(() => useGoals(), { wrapper })
    const { result: categories } = renderHook(() => useCategories(), {
      wrapper,
    })
    const { result: subscriptions } = renderHook(() => useSubscriptions(), {
      wrapper,
    })

    await waitFor(() => {
      expect(accounts.current.fetchStatus).toBe('idle')
    })
    expect(transactions.current.fetchStatus).toBe('idle')
    expect(budgets.current.fetchStatus).toBe('idle')
    expect(goals.current.fetchStatus).toBe('idle')
    expect(categories.current.fetchStatus).toBe('idle')
    expect(subscriptions.current.fetchStatus).toBe('idle')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns default values when query data is unavailable', async () => {
    const {
      useMonthlyStats,
      useTotalBalance,
      useCreditCardUtilization,
      useBudgetProgress,
      useGoalProgress,
    } = await loadHooks()
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper(null)
    const { result: monthlyStats } = renderHook(() => useMonthlyStats(), {
      wrapper,
    })
    const { result: totalBalance } = renderHook(() => useTotalBalance(), {
      wrapper,
    })
    const { result: utilization } = renderHook(
      () => useCreditCardUtilization(),
      { wrapper }
    )
    const { result: budgetProgress } = renderHook(
      () => useBudgetProgress('missing'),
      { wrapper }
    )
    const { result: goalProgress } = renderHook(
      () => useGoalProgress('missing'),
      { wrapper }
    )

    expect(monthlyStats.current.monthlyIncome).toBe(0)
    expect(monthlyStats.current.monthlyExpenses).toBe(0)
    expect(monthlyStats.current.netIncome).toBe(0)
    expect(monthlyStats.current.transactionCount).toBe(0)
    expect(totalBalance.current).toBe(0)
    expect(utilization.current.totalLimit).toBe(0)
    expect(utilization.current.totalBalance).toBe(0)
    expect(utilization.current.utilization).toBe(0)
    expect(budgetProgress.current).toBe(0)
    expect(goalProgress.current).toBe(0)
  })

  it('returns zero utilization when credit limits are missing', async () => {
    const { useCreditCardUtilization } = await loadHooks()
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: [
          {
            id: 'acc1',
            userId: 'user-1',
            name: 'Card',
            type: 'CREDIT_CARD',
            balance: -100,
            currency: 'USD',
            isActive: true,
          },
        ],
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useCreditCardUtilization(), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.totalBalance).toBe(100)
    })
    expect(result.current.totalLimit).toBe(0)
    expect(result.current.utilization).toBe(0)
  })

  it('returns zero utilization when total limit is zero', async () => {
    const { useCreditCardUtilization } = await loadHooks()
    const fetchMock = vi.fn().mockResolvedValue(
      createFetchResponse({
        ok: true,
        json: [
          {
            id: 'acc1',
            userId: 'user-1',
            name: 'Card',
            type: 'CREDIT_CARD',
            balance: -100,
            creditLimit: 0,
            currency: 'USD',
            isActive: true,
          },
        ],
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result } = renderHook(() => useCreditCardUtilization(), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current.totalBalance).toBe(100)
    })
    expect(result.current.totalLimit).toBe(0)
    expect(result.current.utilization).toBe(0)
  })

  it('uses explicit budget end dates for progress calculations', async () => {
    const { queryKeys, useBudgetProgress } = await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValue(createFetchResponse({ ok: true, json: [] }))
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper, queryClient } = createQueryWrapper()
    queryClient.setQueryData(queryKeys.budgets, [
      {
        id: 'budget-1',
        userId: 'user-1',
        name: 'Groceries',
        amount: 100,
        period: 'MONTHLY',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-15'),
        isActive: true,
        isRecurring: true,
        categoryId: 'cat1',
      },
    ])
    queryClient.setQueryData(queryKeys.transactions, [
      {
        id: 'txn-1',
        userId: 'user-1',
        accountId: 'acc1',
        amount: 150,
        description: 'Groceries',
        date: new Date('2026-02-10'),
        type: 'EXPENSE',
        isRecurring: false,
        tags: [],
        categoryId: 'cat1',
      },
    ])

    const { result } = renderHook(() => useBudgetProgress('budget-1'), {
      wrapper,
    })

    await waitFor(() => {
      expect(result.current).toBe(100)
    })
  })

  it('reports query errors for secondary fetches', async () => {
    const {
      useAccounts,
      useBudgets,
      useGoals,
      useCategories,
      useSubscriptions,
    } = await loadHooks()
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
      .mockResolvedValueOnce(
        createFetchResponse({ ok: false, status: 500, text: 'fail' })
      )
    vi.stubGlobal('fetch', fetchMock)

    const { wrapper } = createQueryWrapper()
    const { result: accounts } = renderHook(() => useAccounts(), { wrapper })
    const { result: budgets } = renderHook(() => useBudgets(), { wrapper })
    const { result: goals } = renderHook(() => useGoals(), { wrapper })
    const { result: categories } = renderHook(() => useCategories(), {
      wrapper,
    })
    const { result: subscriptions } = renderHook(() => useSubscriptions(), {
      wrapper,
    })

    await waitFor(() => {
      expect(accounts.current.isError).toBe(true)
    })
    expect(budgets.current.isError).toBe(true)
    expect(goals.current.isError).toBe(true)
    expect(categories.current.isError).toBe(true)
    expect(subscriptions.current.isError).toBe(true)
  })
})
