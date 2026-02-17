'use client'

import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface AddReminderModalProps {
  onReminderAdded?: (reminder: {
    title: string
    description?: string
    dueAt: string
    type: 'budget' | 'bill' | 'goal' | 'custom'
    priority: 'low' | 'medium' | 'high'
  }) => Promise<void> | void
  buttonLabel?: string
  buttonVariant?: ButtonProps['variant']
  className?: string
}

const getDefaultDueAtValue = () => {
  const date = new Date()
  const timezoneOffset = date.getTimezoneOffset()
  const localTime = new Date(date.getTime() - timezoneOffset * 60 * 1000)
  return localTime.toISOString().slice(0, 16)
}

export function AddReminderModal({
  onReminderAdded,
  buttonLabel = 'Add Reminder',
  buttonVariant = 'outline',
  className = '',
}: AddReminderModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueAt: getDefaultDueAtValue(),
    type: 'custom' as 'budget' | 'bill' | 'goal' | 'custom',
    priority: 'medium' as 'low' | 'medium' | 'high',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast({
        title: 'Missing title',
        description: 'Please enter a reminder title.',
        variant: 'destructive',
      })
      return
    }

    const dueAt = new Date(formData.dueAt)
    if (Number.isNaN(dueAt.getTime())) {
      toast({
        title: 'Invalid date',
        description: 'Please choose a valid reminder date and time.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      await onReminderAdded?.({
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        dueAt: dueAt.toISOString(),
        type: formData.type,
        priority: formData.priority,
      })

      toast({
        title: 'Reminder added',
        description: `${formData.title.trim()} has been scheduled.`,
      })

      setOpen(false)
      setFormData({
        title: '',
        description: '',
        dueAt: getDefaultDueAtValue(),
        type: 'custom',
        priority: 'medium',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add reminder. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = <TField extends keyof typeof formData>(
    field: TField,
    value: (typeof formData)[TField]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={buttonVariant}
          size="sm"
          className={`text-xs ${className}`}
        >
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Reminder</DialogTitle>
          <DialogDescription>
            Set a reminder for important financial tasks and deadlines.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Pay credit card bill"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any additional details..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueAt">Date and time</Label>
            <div className="relative">
              <CalendarClock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="dueAt"
                type="datetime-local"
                value={formData.dueAt}
                onChange={(e) => handleInputChange('dueAt', e.target.value)}
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  handleInputChange('type', value as typeof formData.type)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bill">Bill Payment</SelectItem>
                  <SelectItem value="budget">Budget Review</SelectItem>
                  <SelectItem value="goal">Goal Check-in</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  handleInputChange(
                    'priority',
                    value as typeof formData.priority
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Reminder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
