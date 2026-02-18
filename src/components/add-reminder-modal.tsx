'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Clock3 } from 'lucide-react'
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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

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
  date.setSeconds(0, 0)
  const roundedMinutes = Math.ceil(date.getMinutes() / 5) * 5
  if (roundedMinutes === 60) {
    date.setHours(date.getHours() + 1, 0, 0, 0)
  } else {
    date.setMinutes(roundedMinutes, 0, 0)
  }

  const dateValue = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  const hour24 = date.getHours()
  const meridiem = hour24 >= 12 ? 'PM' : 'AM'
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12

  return {
    dateValue,
    hourValue: String(hour12).padStart(2, '0'),
    minuteValue: String(date.getMinutes()).padStart(2, '0'),
    meridiemValue: meridiem as 'AM' | 'PM',
  }
}

const formatDateForInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`

export function AddReminderModal({
  onReminderAdded,
  buttonLabel = 'Add Reminder',
  buttonVariant = 'outline',
  className = '',
}: AddReminderModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const defaultDueAtValues = getDefaultDueAtValue()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: defaultDueAtValues.dateValue,
    dueHour: defaultDueAtValues.hourValue,
    dueMinute: defaultDueAtValues.minuteValue,
    dueMeridiem: defaultDueAtValues.meridiemValue,
    type: 'custom' as 'budget' | 'bill' | 'goal' | 'custom',
    priority: 'medium' as 'low' | 'medium' | 'high',
  })

  const hourOptions = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, '0')
  )
  const minuteOptions = Array.from({ length: 12 }, (_, index) =>
    String(index * 5).padStart(2, '0')
  )
  const selectedDueDate = formData.dueDate ? new Date(formData.dueDate) : null

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

    const parsedHour = parseInt(formData.dueHour, 10)
    if (
      Number.isNaN(parsedHour) ||
      parsedHour < 1 ||
      parsedHour > 12 ||
      !formData.dueDate
    ) {
      toast({
        title: 'Invalid date',
        description: 'Please choose a valid reminder date and time.',
        variant: 'destructive',
      })
      return
    }

    const hour24 =
      formData.dueMeridiem === 'PM'
        ? parsedHour === 12
          ? 12
          : parsedHour + 12
        : parsedHour === 12
          ? 0
          : parsedHour

    const dueAt = new Date(
      `${formData.dueDate}T${String(hour24).padStart(2, '0')}:${formData.dueMinute}:00`
    )
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
        dueDate: defaultDueAtValues.dateValue,
        dueHour: defaultDueAtValues.hourValue,
        dueMinute: defaultDueAtValues.minuteValue,
        dueMeridiem: defaultDueAtValues.meridiemValue,
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
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-1.5rem)] overflow-y-auto sm:max-w-[425px]">
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

          <div className="space-y-3">
            <Label htmlFor="dueDate">Date and time</Label>
            <div className="relative rounded-xl border border-border/60 bg-muted/10 p-3">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                Schedule
              </div>
              <div className="space-y-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dueDate"
                      type="button"
                      variant="outline"
                      className={cn(
                        'min-h-10 w-full justify-start text-left font-normal',
                        !formData.dueDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDueDate ? (
                        format(selectedDueDate, 'PPP')
                      ) : (
                        <span>Select date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[min(20rem,calc(100vw-2rem))] p-2"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={selectedDueDate ?? undefined}
                      onSelect={(date) => {
                        handleInputChange(
                          'dueDate',
                          date ? formatDateForInput(date) : ''
                        )
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="col-span-2 space-y-1 sm:col-span-1">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      Hour
                    </p>
                    <Select
                      value={formData.dueHour}
                      onValueChange={(value) =>
                        handleInputChange('dueHour', value)
                      }
                    >
                      <SelectTrigger className="h-10 min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {hourOptions.map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      Minute
                    </p>
                    <Select
                      value={formData.dueMinute}
                      onValueChange={(value) =>
                        handleInputChange('dueMinute', value)
                      }
                    >
                      <SelectTrigger className="h-10 min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {minuteOptions.map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      Period
                    </p>
                    <Select
                      value={formData.dueMeridiem}
                      onValueChange={(value) =>
                        handleInputChange('dueMeridiem', value as 'AM' | 'PM')
                      }
                    >
                      <SelectTrigger className="h-10 min-w-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
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
