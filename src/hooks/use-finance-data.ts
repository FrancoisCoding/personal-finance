'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

// Types
export interface Account {
  id: string
  userId: string
  name: string
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'INVESTMENT' | 'LOAN' | 'OTHER'
  balance: number
  currency: string
  institution?: string
  accountNumber?: string
  description?: string
  isActive: boolean
  creditLimit?: number
}

export interface Transaction {
  id: string
  userId: string
  accountId: string
  categoryId?: string
  category?: string
  amount: number
  description: string
  date: Date
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  isRecurring: boolean
  tags: string[]
  notes?: string
  categoryRelation?: {
    id: string
    name: string
    color: string
    icon?: string
  }
  account?: {
    id: string
    name: string
    type: string
  }
}

export interface Budget {
  id: string
  userId: string
  categoryId?: string
  name: string
  amount: number
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  startDate: Date
  endDate?: Date
  isActive: boolean
  isRecurring: boolean
  category?: {
    id: string
    name: string
    color: string
    icon?: string
  }
}

export interface Goal {
  id: string
  userId: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate?: Date
  color: string
  icon?: string
  isCompleted: boolean
}

export interface Category {
  id: string
  userId: string
  name: string
  color: string
  icon?: string
  isIncome?: boolean
}

export interface Subscription {
  id: string
  userId: string
  name: string
  description?: string
  amount: number
  currency: string
  billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'WEEKLY' | 'CUSTOM'
  nextBillingDate: string
  categoryId?: string
  isActive: boolean
  notes?: string
  category?: Category
}

// Query Keys
export const queryKeys = {
  accounts: ['accounts'] as const,
  transactions: ['transactions'] as const,
  budgets: ['budgets'] as const,
  goals: ['goals'] as const,
  categories: ['categories'] as const,
  subscriptions: ['subscriptions'] as const,
  monthlyStats: ['monthlyStats'] as const,
}

// API Functions
const fetchAccounts = async (): Promise<Account[]> => {
  const res = await fetch('/api/accounts')
  if (!res.ok) throw new Error('Failed to fetch accounts')
  return res.json()
}

const fetchTransactions = async (): Promise<Transaction[]> => {
  const res = await fetch('/api/transactions')
  if (!res.ok) throw new Error('Failed to fetch transactions')
  return res.json()
}

const fetchBudgets = async (): Promise<Budget[]> => {
  const res = await fetch('/api/budgets')
  if (!res.ok) throw new Error('Failed to fetch budgets')
  return res.json()
}

const fetchGoals = async (): Promise<Goal[]> => {
  const res = await fetch('/api/goals')
  if (!res.ok) throw new Error('Failed to fetch goals')
  return res.json()
}

const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch('/api/categories')
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const res = await fetch('/api/subscriptions')
  if (!res.ok) throw new Error('Failed to fetch subscriptions')
  return res.json()
}

// Custom Hooks
export function useAccounts() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: fetchAccounts,
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTransactions() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: queryKeys.transactions,
    queryFn: fetchTransactions,
    enabled: !!session?.user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useBudgets() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: queryKeys.budgets,
    queryFn: fetchBudgets,
    enabled: !!session?.user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useGoals() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: queryKeys.goals,
    queryFn: fetchGoals,
    enabled: !!session?.user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCategories() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: fetchCategories,
    enabled: !!session?.user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useSubscriptions() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: queryKeys.subscriptions,
    queryFn: fetchSubscriptions,
    enabled: !!session?.user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Computed Data Hooks
export function useMonthlyStats() {
  const { data: transactions = [] } = useTransactions()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const monthlyIncome = transactions
    .filter(
      (t) =>
        t.type === 'INCOME' &&
        new Date(t.date) >= startOfMonth &&
        new Date(t.date) <= endOfMonth
    )
    .reduce((total, t) => total + t.amount, 0)

  const monthlyExpenses = transactions
    .filter(
      (t) =>
        t.type === 'EXPENSE' &&
        new Date(t.date) >= startOfMonth &&
        new Date(t.date) <= endOfMonth
    )
    .reduce((total, t) => total + t.amount, 0)

  const netIncome = monthlyIncome - monthlyExpenses

  return {
    monthlyIncome,
    monthlyExpenses,
    netIncome,
    transactionCount: transactions.length,
  }
}

export function useTotalBalance() {
  const { data: accounts = [] } = useAccounts()

  const totalBalance = accounts.reduce(
    (total, account) => total + account.balance,
    0
  )

  return totalBalance
}

export function useCreditCardUtilization() {
  const { data: accounts = [] } = useAccounts()

  const creditCards = accounts.filter(
    (account) => account.type === 'CREDIT_CARD'
  )

  if (creditCards.length === 0) {
    return { utilization: 0, totalLimit: 0, totalBalance: 0 }
  }

  const totalLimit = creditCards.reduce(
    (total, card) => total + (card.creditLimit || 0),
    0
  )
  const totalBalance = creditCards.reduce(
    (total, card) => total + Math.abs(card.balance),
    0
  )

  const utilization = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0

  return {
    utilization: Math.round(utilization * 100) / 100, // Round to 2 decimal places
    totalLimit,
    totalBalance,
  }
}

export function useBudgetProgress(budgetId: string) {
  const { data: budgets = [] } = useBudgets()
  const { data: transactions = [] } = useTransactions()

  const budget = budgets.find((b) => b.id === budgetId)
  if (!budget) return 0

  const now = new Date()
  const startDate = new Date(budget.startDate)
  const endDate = budget.endDate
    ? new Date(budget.endDate)
    : new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const spent = transactions
    .filter(
      (t) =>
        t.categoryId === budget.categoryId &&
        t.type === 'EXPENSE' &&
        new Date(t.date) >= startDate &&
        new Date(t.date) <= endDate
    )
    .reduce((total, t) => total + t.amount, 0)

  return Math.min((spent / budget.amount) * 100, 100)
}

export function useGoalProgress(goalId: string) {
  const { data: goals = [] } = useGoals()

  const goal = goals.find((g) => g.id === goalId)
  if (!goal) return 0

  return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
}

// Mutation Hooks
export function useCreateTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      })
      if (!res.ok) throw new Error('Failed to create transaction')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      toast({
        title: 'Transaction created',
        description: 'Your transaction has been added successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create transaction',
        variant: 'destructive',
      })
    },
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (account: Omit<Account, 'id' | 'userId'>) => {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      })
      if (!res.ok) throw new Error('Failed to create account')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      toast({
        title: 'Account created',
        description: 'Your account has been added successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      })
    },
  })
}

export function useSyncTransactions() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/teller/sync-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to sync transactions')
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      toast({
        title: 'Transactions synced',
        description: `Successfully synced ${data.transactionsSynced} transactions.`,
      })
    },
    onError: (error) => {
      toast({
        title: 'Sync failed',
        description: error.message || 'Failed to sync transactions',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (accountId: string) => {
      const res = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to delete account')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      toast({
        title: 'Account deleted',
        description: 'Your account has been deleted successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteAllAccounts() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to delete all accounts')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
      toast({
        title: 'Accounts deleted',
        description: 'All accounts have been removed successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete all accounts',
        variant: 'destructive',
      })
    },
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (goal: {
      name: string
      description?: string
      targetAmount: number
      targetDate: Date
      color: string
      icon?: string
    }) => {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal),
      })
      if (!res.ok) throw new Error('Failed to create goal')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals })
      toast({
        title: 'Goal created',
        description: 'Your goal has been created successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create goal',
        variant: 'destructive',
      })
    },
  })
}

export function useCreateBudget() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (budget: {
      name: string
      amount: number
      period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
      categoryId?: string
      startDate: Date
      endDate?: Date
      isRecurring: boolean
    }) => {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget),
      })
      if (!res.ok) throw new Error('Failed to create budget')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets })
      toast({
        title: 'Budget created',
        description: 'Your budget has been created successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create budget',
        variant: 'destructive',
      })
    },
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (subscription: {
      name: string
      amount: number
      billingCycle: 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
      nextBillingDate: Date
      categoryId?: string
      notes?: string
    }) => {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      })
      if (!res.ok) throw new Error('Failed to create subscription')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions })
      toast({
        title: 'Subscription created',
        description: 'Your subscription has been created successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create subscription',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Subscription>
    }) => {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update subscription')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions })
      toast({
        title: 'Subscription updated',
        description: 'Your subscription has been updated successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update subscription',
        variant: 'destructive',
      })
    },
  })
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to delete subscription')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions })
      toast({
        title: 'Subscription removed',
        description: 'The subscription has been deleted successfully.',
      })
    },
    onError: (error) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete subscription',
        variant: 'destructive',
      })
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string
      updates: Partial<Transaction>
    }) => {
      const res = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update transaction')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update transaction',
        variant: 'destructive',
      })
    },
  })
}

export function useSeedCategories() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/categories/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error('Failed to seed categories')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to seed categories',
        variant: 'destructive',
      })
    },
  })
}

// Add this new hook for credit cards
export function useCreditCards() {
  return useQuery({
    queryKey: ['credit-cards'],
    queryFn: async () => {
      const response = await fetch('/api/credit-cards')
      if (!response.ok) {
        throw new Error('Failed to fetch credit cards')
      }
      return response.json()
    },
  })
}
