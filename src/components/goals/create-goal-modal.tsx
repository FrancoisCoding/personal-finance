'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FormModal } from '@/components/ui/form-modal'

import { useToast } from '@/hooks/use-toast'
// Simplified Category type that matches what the hooks return
interface SimpleCategory {
  id: string
  userId: string
  name: string
  color: string
  icon?: string
}

interface CreateGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (goalData: {
    name: string
    description?: string
    targetAmount: number
    targetDate: Date
    color: string
    icon?: string
  }) => void
  isLoading?: boolean
  categories: SimpleCategory[]
}

export function CreateGoalModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  categories = [],
}: CreateGoalModalProps) {
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    color: '#10B981',
    icon: 'Target',
  })

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter a goal name.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid target amount.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.targetDate) {
      toast({
        title: 'Missing date',
        description: 'Please select a target date.',
        variant: 'destructive',
      })
      return
    }

    onSubmit({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      targetAmount: parseFloat(formData.targetAmount),
      targetDate: new Date(formData.targetDate),
      color: formData.color,
      icon: formData.icon,
    })

    // Reset form
    setFormData({
      name: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      color: '#10B981',
      icon: 'Target',
    })
  }

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      targetAmount: '',
      targetDate: '',
      color: '#10B981',
      icon: 'Target',
    })
    onOpenChange(false)
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create a Goal"
      description="Set a new financial goal to track your progress"
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      submitText="Create Goal"
      isLoading={isLoading}
      disabled={
        !formData.name.trim() || !formData.targetAmount || !formData.targetDate
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Goal Name</Label>
          <Input
            id="name"
            placeholder="e.g., Save for vacation, Pay off credit card"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add more detail about your goal..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Amount</Label>
            <Input
              id="targetAmount"
              type="number"
              placeholder="0.00"
              value={formData.targetAmount}
              onChange={(e) =>
                setFormData({ ...formData, targetAmount: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) =>
                setFormData({ ...formData, targetDate: e.target.value })
              }
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Goal Color</Label>
          <div className="flex gap-2">
            {[
              '#10B981',
              '#3B82F6',
              '#8B5CF6',
              '#F59E0B',
              '#EF4444',
              '#06B6D4',
            ].map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full border-2 ${
                  formData.color === color
                    ? 'border-gray-900'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData({ ...formData, color })}
              />
            ))}
          </div>
        </div>
      </div>
    </FormModal>
  )
}
