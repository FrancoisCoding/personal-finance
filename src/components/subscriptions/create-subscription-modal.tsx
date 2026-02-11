'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FormModal } from '@/components/ui/form-modal'

import { useToast } from '@/hooks/use-toast'

type TSubscriptionBillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
// Simplified Category type that matches what the hooks return
interface SimpleCategory {
  id: string
  userId: string
  name: string
  color: string
  icon?: string
}

interface CreateSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (subscriptionData: {
    name: string
    amount: number
    billingCycle: TSubscriptionBillingCycle
    nextBillingDate: Date
    categoryId?: string
    notes?: string
  }) => void
  isLoading?: boolean
  categories: SimpleCategory[]
}

export function CreateSubscriptionModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  categories = [],
}: CreateSubscriptionModalProps) {
  const { toast } = useToast()

  const [formData, setFormData] = useState<{
    name: string
    amount: string
    billingCycle: TSubscriptionBillingCycle
    nextBillingDate: string
    categoryId: string
    notes: string
  }>({
    name: '',
    amount: '',
    billingCycle: 'MONTHLY',
    nextBillingDate: '',
    categoryId: '',
    notes: '',
  })

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a subscription name.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid subscription amount.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.nextBillingDate) {
      toast({
        title: 'Missing date',
        description: 'Please select the next billing date.',
        variant: 'destructive',
      })
      return
    }

    onSubmit({
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      billingCycle: formData.billingCycle,
      nextBillingDate: new Date(formData.nextBillingDate),
      categoryId: formData.categoryId || undefined,
      notes: formData.notes.trim() || undefined,
    })

    // Reset form
    setFormData({
      name: '',
      amount: '',
      billingCycle: 'MONTHLY',
      nextBillingDate: '',
      categoryId: '',
      notes: '',
    })
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      amount: '',
      billingCycle: 'MONTHLY',
      nextBillingDate: '',
      categoryId: '',
      notes: '',
    })
    onOpenChange(false)
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create a Subscription"
      description="Track your recurring payments and subscriptions"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText="Create Subscription"
      isLoading={isLoading}
      disabled={
        !formData.name.trim() || !formData.amount || !formData.nextBillingDate
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Subscription Name</Label>
          <Input
            id="name"
            placeholder="e.g., Netflix, Spotify, Gym Membership"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <select
              id="billingCycle"
              value={formData.billingCycle}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  billingCycle: e.target.value as TSubscriptionBillingCycle,
                })
              }
              className="w-full p-2 border rounded-md bg-background text-foreground"
            >
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
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
            <option value="">No specific category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nextBillingDate">Next Billing Date</Label>
          <Input
            id="nextBillingDate"
            type="date"
            value={formData.nextBillingDate}
            onChange={(e) =>
              setFormData({ ...formData, nextBillingDate: e.target.value })
            }
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes about this subscription..."
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
