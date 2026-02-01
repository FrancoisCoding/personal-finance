'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FormModal } from '@/components/ui/form-modal'
import { useCreateTransaction } from '@/hooks/use-finance-data'
import { useToast } from '@/hooks/use-toast'
// Simplified types that match what the hooks return
interface SimpleAccount {
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

interface SimpleCategory {
  id: string
  userId: string
  name: string
  color: string
  icon?: string
}

interface AddTransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (transactionData: {
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
    accountId: string
    categoryId?: string
    date: Date
    notes?: string
  }) => void
  isLoading?: boolean
  accounts: SimpleAccount[]
  categories: SimpleCategory[]
}

export function AddTransactionModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  accounts = [],
  categories = [],
}: AddTransactionModalProps) {
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE' | 'TRANSFER',
    accountId: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  const handleSubmit = () => {
    if (!formData.description.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a transaction description.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.accountId) {
      toast({
        title: 'Missing account',
        description: 'Please select an account.',
        variant: 'destructive',
      })
      return
    }

    onSubmit({
      description: formData.description.trim(),
      amount: parseFloat(formData.amount),
      type: formData.type,
      accountId: formData.accountId,
      categoryId: formData.categoryId || undefined,
      date: new Date(formData.date),
      notes: formData.notes.trim() || undefined,
    })

    // Reset form
    setFormData({
      description: '',
      amount: '',
      type: 'EXPENSE',
      accountId: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    })
  }

  const handleCancel = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'EXPENSE',
      accountId: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
    })
    onOpenChange(false)
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Transaction"
      description="Record a new income or expense transaction"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText="Add Transaction"
      isLoading={isLoading}
      disabled={
        !formData.description.trim() || !formData.amount || !formData.accountId
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="e.g., Grocery shopping, Salary payment"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as any })
              }
              className="w-full p-2 border rounded-md bg-background text-foreground"
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account">Account</Label>
            <select
              id="account"
              value={formData.accountId}
              onChange={(e) =>
                setFormData({ ...formData, accountId: e.target.value })
              }
              className="w-full p-2 border rounded-md bg-background text-foreground"
            >
              <option value="">Select an account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - {account.type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full p-2 border rounded-md bg-background text-foreground"
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
          />
        </div>
      </div>
    </FormModal>
  )
}
