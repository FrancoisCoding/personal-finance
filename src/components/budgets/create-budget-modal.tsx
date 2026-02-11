'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormModal } from '@/components/ui/form-modal'

import { useToast } from '@/hooks/use-toast'
import type { Category } from '@/hooks/use-finance-data'

type TBudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

interface CreateBudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (budgetData: {
    name: string
    amount: number
    period: TBudgetPeriod
    categoryId?: string
    startDate: Date
    endDate?: Date
    isRecurring: boolean
  }) => void
  isLoading?: boolean
  categories: Category[]
}

export function CreateBudgetModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  categories = [],
}: CreateBudgetModalProps) {
  const { toast } = useToast()

  const [formData, setFormData] = useState<{
    name: string
    amount: string
    period: TBudgetPeriod
    categoryId: string
    startDate: string
    endDate: string
    isRecurring: boolean
  }>({
    name: '',
    amount: '',
    period: 'MONTHLY',
    categoryId: '',
    startDate: '',
    endDate: '',
    isRecurring: false,
  })

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a budget name.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid budget amount.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.startDate) {
      toast({
        title: 'Missing date',
        description: 'Please select a start date.',
        variant: 'destructive',
      })
      return
    }

    onSubmit({
      name: formData.name.trim(),
      amount: parseFloat(formData.amount),
      period: formData.period,
      categoryId: formData.categoryId || undefined,
      startDate: new Date(formData.startDate),
      endDate: formData.isRecurring
        ? undefined
        : formData.endDate
          ? new Date(formData.endDate)
          : undefined,
      isRecurring: formData.isRecurring,
    })

    // Reset form
    setFormData({
      name: '',
      amount: '',
      period: 'MONTHLY',
      categoryId: '',
      startDate: '',
      endDate: '',
      isRecurring: false,
    })
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      amount: '',
      period: 'MONTHLY',
      categoryId: '',
      startDate: '',
      endDate: '',
      isRecurring: false,
    })
    onOpenChange(false)
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create a Budget"
      description="Set spending limits for different categories"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText="Create Budget"
      isLoading={isLoading}
      disabled={
        !formData.name.trim() || !formData.amount || !formData.startDate
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Budget Name</Label>
          <Input
            id="name"
            placeholder="e.g., Groceries, Entertainment, Transportation"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
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
            <Label htmlFor="period">Period</Label>
            <select
              id="period"
              value={formData.period}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  period: e.target.value as TBudgetPeriod,
                })
              }
              className="w-full p-2 border rounded-md bg-background text-foreground"
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
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

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isRecurring"
            checked={formData.isRecurring}
            onChange={(e) =>
              setFormData({ ...formData, isRecurring: e.target.checked })
            }
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="isRecurring" className="text-sm font-medium">
            Recurring Budget
          </Label>
        </div>

        <div
          className={
            formData.isRecurring ? 'space-y-2' : 'grid grid-cols-2 gap-4'
          }
        >
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>

          {!formData.isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                min={formData.startDate}
              />
            </div>
          )}
        </div>
      </div>
    </FormModal>
  )
}
