'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useDemoMode } from '@/hooks/use-demo-mode'
import {
  Plus,
  CreditCard,
  Building2,
  Wallet,
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  useAccounts,
  useTransactions,
  useCreateAccount,
  useDeleteAccount,
  useDeleteAllAccounts,
} from '@/hooks/use-finance-data'

type TAccountType =
  | 'CHECKING'
  | 'SAVINGS'
  | 'CREDIT_CARD'
  | 'INVESTMENT'
  | 'LOAN'
  | 'OTHER'

export default function AccountsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { isDemoMode } = useDemoMode()
  const { data: accounts = [], isLoading } = useAccounts()
  const { data: transactions = [] } = useTransactions()
  const createAccountMutation = useCreateAccount()
  const deleteAccountMutation = useDeleteAccount()
  const deleteAllAccountsMutation = useDeleteAllAccounts()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showBalances, setShowBalances] = useState(true)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'CHECKING' as TAccountType,
    balance: '',
    accountNumber: '',
    institution: '',
    description: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated' && !isDemoMode) {
      router.push('/auth/login')
    }
  }, [status, router, isDemoMode])

  useEffect(() => {
    if (status === 'unauthenticated' && !isDemoMode) {
      router.push('/auth/login')
    }
  }, [status, router, isDemoMode])

  if (status === 'loading' || isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={`account-summary-${index}`}
              className="border-border/60 bg-card/80 shadow-sm"
            >
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card
                key={`account-card-${index}`}
                className="border-border/60 bg-card/80 shadow-sm"
              >
                <CardContent className="space-y-5 p-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, tileIndex) => (
                      <Skeleton
                        key={`account-tile-${index}-${tileIndex}`}
                        className="h-16 w-full rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session && !isDemoMode) {
    return null
  }

  const totalBalance = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  )
  const checkingAccounts = accounts.filter((a) => a.type === 'CHECKING')
  const savingsAccounts = accounts.filter((a) => a.type === 'SAVINGS')
  const creditCards = accounts.filter((a) => a.type === 'CREDIT_CARD')

  const totalCreditLimit = creditCards.reduce(
    (sum, card) => sum + (card.creditLimit || 0),
    0
  )
  const totalCreditUsed = creditCards.reduce(
    (sum, card) => sum + Math.abs(Math.min(card.balance, 0)),
    0
  )
  const creditUtilization =
    totalCreditLimit > 0 ? (totalCreditUsed / totalCreditLimit) * 100 : 0

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD':
        return CreditCard
      case 'SAVINGS':
        return Building2
      default:
        return Wallet
    }
  }

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD':
        return 'text-emerald-500'
      case 'SAVINGS':
        return 'text-emerald-500'
      default:
        return 'text-emerald-500'
    }
  }

  const handleCreateAccount = () => {
    if (!newAccount.name || !newAccount.balance) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    const accountData = {
      name: newAccount.name,
      type: newAccount.type,
      balance: parseFloat(newAccount.balance),
      accountNumber: newAccount.accountNumber || undefined,
      institution: newAccount.institution || undefined,
      currency: 'USD',
      isActive: true,
    }

    createAccountMutation.mutate(accountData, {
      onSuccess: () => {
        setNewAccount({
          name: '',
          type: 'CHECKING',
          balance: '',
          accountNumber: '',
          institution: '',
          description: '',
        })
        setShowCreateForm(false)
      },
    })
  }

  const handleDeleteAccount = (accountId: string) => {
    setAccountToDelete(accountId)
  }

  const confirmDeleteAccount = () => {
    if (accountToDelete) {
      deleteAccountMutation.mutate(accountToDelete, {
        onSuccess: () => {
          setAccountToDelete(null)
        },
      })
    }
  }

  const confirmDeleteAllAccounts = () => {
    deleteAllAccountsMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteAllDialog(false)
      },
    })
  }

  const getRecentTransactions = (accountId: string) => {
    return transactions
      .filter((t) => t.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Accounts overview
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Accounts</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Manage your bank accounts, credit cards, and balances in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBalances(!showBalances)}
          >
            {showBalances ? (
              <EyeOff className="w-4 h-4 mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            {showBalances ? 'Hide' : 'Show'} Balances
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteAllDialog(true)}
            disabled={accounts.length === 0}
          >
            Delete All
          </Button>
        </div>
      </div>

      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        data-demo-step="demo-accounts"
      >
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total balance
                </p>
                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
                  {showBalances ? formatCurrency(totalBalance) : '******'}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Across {accounts.length} accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Checking
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {checkingAccounts.length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {checkingAccounts.length === 1
                ? '1 checking account'
                : `${checkingAccounts.length} checking accounts`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Savings
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {savingsAccounts.length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {savingsAccounts.length === 1
                ? '1 savings account'
                : `${savingsAccounts.length} savings accounts`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Credit cards
                </p>
                <p className="text-2xl font-semibold text-foreground">
                  {creditCards.length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CreditCard className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {creditCards.length > 0
                ? `${creditUtilization.toFixed(1)}% utilization`
                : 'No credit cards connected'}
            </p>
          </CardContent>
        </Card>
      </div>

      {showCreateForm && (
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>Add New Account</CardTitle>
            <CardDescription>
              Add a bank account or credit card to track your finances.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Account Name
                </label>
                <Input
                  placeholder="e.g., Chase Checking, Amex Gold"
                  value={newAccount.name}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Account Type
                </label>
                <select
                  value={newAccount.type}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      type: e.target.value as TAccountType,
                    })
                  }
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="INVESTMENT">Investment</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  {newAccount.type === 'CREDIT_CARD'
                    ? 'Current Balance'
                    : 'Balance'}
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newAccount.balance}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, balance: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Institution (Optional)
                </label>
                <Input
                  placeholder="e.g., Chase Bank, American Express"
                  value={newAccount.institution}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      institution: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Account Number (Optional)
                </label>
                <Input
                  placeholder="Last 4 digits"
                  value={newAccount.accountNumber}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      accountNumber: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description (Optional)
                </label>
                <Input
                  placeholder="Additional notes..."
                  value={newAccount.description}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateAccount}>Add Account</Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your accounts</h2>
            <p className="text-sm text-muted-foreground">
              {accounts.length === 1
                ? '1 account connected'
                : `${accounts.length} accounts connected`}
            </p>
          </div>
        </div>

        {accounts.length === 0 ? (
          <Card className="border-border/60 bg-card/80 shadow-sm">
            <CardContent>
              <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No accounts yet
                </p>
                <p className="mt-1 mb-5 text-xs text-muted-foreground">
                  Add your first account to start tracking your finances.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Account
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {accounts.map((account) => {
              const IconComponent = getAccountIcon(account.type)
              const accountColor = getAccountColor(account.type)
              const recentTransactions = getRecentTransactions(account.id)
              const lastActivity = recentTransactions[0]?.date
                ? formatDate(recentTransactions[0].date)
                : 'No recent activity'
              const accountStatus =
                account.isActive === false ? 'Paused' : 'Active'
              const balanceClassName =
                account.balance < 0
                  ? 'text-rose-600 dark:text-rose-300'
                  : 'text-emerald-600 dark:text-emerald-300'

              return (
                <Card
                  key={account.id}
                  className="border-border/60 bg-card/80 shadow-sm"
                >
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-muted/30">
                          <IconComponent
                            className={`h-5 w-5 ${accountColor}`}
                          />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg">
                            {account.name}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-1">
                              {account.type.toLowerCase().replace('_', ' ')}
                            </span>
                            {account.institution && (
                              <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-1">
                                {account.institution}
                              </span>
                            )}
                            {account.accountNumber && (
                              <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-1">
                                ****{account.accountNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" size="sm">
                          Sync
                        </Button>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className={`rounded-full border px-2 py-1 ${
                          account.isActive === false
                            ? 'border-border/60 bg-muted/30 text-muted-foreground'
                            : 'border-emerald-200/60 bg-emerald-50/50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-500/10 dark:text-emerald-300'
                        }`}
                      >
                        {accountStatus}
                      </span>
                      <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-1">
                        {recentTransactions.length} recent transactions
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <p className="text-xs text-muted-foreground">
                          Current Balance
                        </p>
                        <p
                          className={`mt-1 text-lg font-semibold ${balanceClassName}`}
                        >
                          {showBalances
                            ? formatCurrency(account.balance)
                            : '******'}
                        </p>
                      </div>
                      {account.type === 'CREDIT_CARD' &&
                        account.creditLimit && (
                          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                            <p className="text-xs text-muted-foreground">
                              Credit Limit
                            </p>
                            <p className="mt-1 text-lg font-semibold text-foreground">
                              {showBalances
                                ? formatCurrency(account.creditLimit)
                                : '******'}
                            </p>
                          </div>
                        )}
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <p className="text-xs text-muted-foreground">
                          Account Type
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {account.type.toLowerCase().replace('_', ' ')}
                        </p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <p className="text-xs text-muted-foreground">
                          Last Activity
                        </p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {lastActivity}
                        </p>
                      </div>
                    </div>

                    {recentTransactions.length > 0 && (
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-foreground">
                            Recent transactions
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            Showing {recentTransactions.length}
                          </span>
                        </div>
                        <div className="mt-3 space-y-3">
                          {recentTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between gap-4"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {transaction.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    transaction.date
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <p
                                className={`text-sm font-semibold ${
                                  transaction.type === 'INCOME'
                                    ? 'text-emerald-600 dark:text-emerald-300'
                                    : 'text-rose-600 dark:text-rose-300'
                                }`}
                              >
                                {transaction.type === 'INCOME' ? '+' : '-'}
                                {showBalances
                                  ? formatCurrency(transaction.amount)
                                  : '******'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {account.description && (
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                        <p className="text-sm text-muted-foreground">
                          {account.description}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Dialog
        open={!!accountToDelete}
        onOpenChange={() => setAccountToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this account? This action cannot
              be undone and will also delete all associated transactions.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAccountToDelete(null)}
              disabled={deleteAccountMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAccount}
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Accounts</DialogTitle>
            <DialogDescription>
              This is irreversible. All accounts, connected data, and
              transactions will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteAllDialog(false)}
              disabled={deleteAllAccountsMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteAllAccounts}
              disabled={deleteAllAccountsMutation.isPending}
            >
              {deleteAllAccountsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete All Accounts'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
