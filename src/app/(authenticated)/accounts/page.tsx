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
} from '@/hooks/use-finance-data'

export default function AccountsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const { data: accounts = [], isLoading } = useAccounts()
  const { data: transactions = [] } = useTransactions()
  const createAccountMutation = useCreateAccount()
  const deleteAccountMutation = useDeleteAccount()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showBalances, setShowBalances] = useState(true)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'CHECKING' as
      | 'CHECKING'
      | 'SAVINGS'
      | 'CREDIT_CARD'
      | 'INVESTMENT'
      | 'LOAN'
      | 'OTHER',
    balance: '',
    accountNumber: '',
    institution: '',
    description: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Calculate account statistics
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

  // Get account icon
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

  // Get account color
  const getAccountColor = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD':
        return 'text-purple-600'
      case 'SAVINGS':
        return 'text-green-600'
      default:
        return 'text-blue-600'
    }
  }

  // Handle account creation
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

  // Handle account deletion
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

  // Get recent transactions for an account
  const getRecentTransactions = (accountId: string) => {
    return transactions
      .filter((t) => t.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3)
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank accounts, credit cards, and track balances
          </p>
        </div>
        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Summary Strip */}
      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Total Balance</p>
                <p className="text-lg font-semibold text-green-600">
                  {showBalances ? formatCurrency(totalBalance) : '••••••'}
                </p>
              </div>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Checking Accounts
                </p>
                <p className="text-lg font-semibold text-blue-600">
                  {checkingAccounts.length}
                </p>
              </div>
              <Wallet className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Savings Accounts</p>
                <p className="text-lg font-semibold text-green-600">
                  {savingsAccounts.length}
                </p>
              </div>
              <Building2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Credit Cards</p>
                <p className="text-lg font-semibold text-purple-600">
                  {creditCards.length}
                </p>
                {creditCards.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {creditUtilization.toFixed(1)}% utilized
                  </p>
                )}
              </div>
              <CreditCard className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Account Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Account</CardTitle>
            <CardDescription>
              Add a bank account or credit card to track your finances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
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
                <label className="text-sm font-medium mb-2 block">
                  Account Type
                </label>
                <select
                  value={newAccount.type}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="CHECKING">Checking</option>
                  <option value="SAVINGS">Savings</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="INVESTMENT">Investment</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
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
                <label className="text-sm font-medium mb-2 block">
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
                <label className="text-sm font-medium mb-2 block">
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
                <label className="text-sm font-medium mb-2 block">
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

      {/* Accounts List */}
      <div className="space-y-6">
        {accounts.length === 0 ? (
          <Card>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No accounts yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-5">
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
          accounts.map((account) => {
            const IconComponent = getAccountIcon(account.type)
            const accountColor = getAccountColor(account.type)
            const recentTransactions = getRecentTransactions(account.id)
            const lastActivity = recentTransactions[0]?.date
              ? formatDate(recentTransactions[0].date)
              : 'No recent activity'
            const accountStatus =
              account.isActive === false ? 'Paused' : 'Active'

            return (
              <Card
                key={account.id}
                className="relative overflow-hidden border-border/60 bg-card/80 shadow-sm"
              >
                <CardHeader>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/60 bg-muted/20">
                          <IconComponent className={`w-6 h-6 ${accountColor}`} />
                        </div>
                        <div className="space-y-2">
                          <CardTitle className="text-xl">
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
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Balance and Details */}
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">
                        Current Balance
                      </p>
                      <p className={`text-lg font-semibold ${accountColor} mt-1`}>
                        {showBalances
                          ? formatCurrency(account.balance)
                          : '••••••'}
                      </p>
                    </div>
                    {account.type === 'CREDIT_CARD' && account.creditLimit && (
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                        <p className="text-xs text-muted-foreground">
                          Credit Limit
                        </p>
                        <p className="text-lg font-semibold text-purple-600 mt-1">
                          {showBalances
                            ? formatCurrency(account.creditLimit)
                            : '••••••'}
                        </p>
                      </div>
                    )}
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
                      <p className="text-xs text-muted-foreground">
                        Account Type
                      </p>
                      <p className="text-lg font-semibold mt-1">
                        {account.type.toLowerCase().replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span
                      className={`rounded-full border px-2 py-1 ${
                        account.isActive === false
                          ? 'border-border/60 bg-muted/30 text-muted-foreground'
                          : 'border-green-200/60 bg-green-50/50 text-green-700'
                      }`}
                    >
                      {accountStatus}
                    </span>
                    <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-1">
                      Last activity: {lastActivity}
                    </span>
                    <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-1">
                      {recentTransactions.length} recent transactions
                    </span>
                  </div>

                  {/* Recent Transactions */}
                  {recentTransactions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Recent Transactions
                      </h4>
                      <div className="space-y-2">
                        {recentTransactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {transaction.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  transaction.date
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <p
                              className={`font-semibold text-sm ${
                                transaction.type === 'INCOME'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {transaction.type === 'INCOME' ? '+' : '-'}
                              {showBalances
                                ? formatCurrency(transaction.amount)
                                : '••••••'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Account Description */}
                  {account.description && (
                    <div className="p-3 rounded-lg border border-border/60 bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        {account.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
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
    </div>
  )
}
