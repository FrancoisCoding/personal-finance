'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/components/notification-system'
import { getDisplayPreferences } from '@/lib/display-preferences'

interface Reminder {
  id: string
  title: string
  description?: string
  dueAt: string
  completed: boolean
  type: 'budget' | 'bill' | 'goal' | 'custom'
  priority: 'low' | 'medium' | 'high'
}

interface RemindersCardProps {
  reminders: Reminder[]
  action?: ReactNode
  onToggleReminder?: (id: string) => void
  onClearCompletedReminders?: () => void
  isClearingCompleted?: boolean
  className?: string
}

export function RemindersCard({
  reminders,
  action,
  onToggleReminder,
  onClearCompletedReminders,
  isClearingCompleted = false,
  className = '',
}: RemindersCardProps) {
  const { addNotification } = useNotifications()
  const displayLocale = getDisplayPreferences().locale
  const upcomingReminders = reminders
    .filter((reminder) => !reminder.completed)
    .sort((firstReminder, secondReminder) => {
      return (
        new Date(firstReminder.dueAt).getTime() -
        new Date(secondReminder.dueAt).getTime()
      )
    })
    .slice(0, 3)
  const completedReminders = reminders
    .filter((reminder) => reminder.completed)
    .sort((firstReminder, secondReminder) => {
      return (
        new Date(secondReminder.dueAt).getTime() -
        new Date(firstReminder.dueAt).getTime()
      )
    })
    .slice(0, 2)

  const priorityStyles: Record<
    Reminder['priority'],
    { dotClassName: string; badgeClassName: string; label: string }
  > = {
    high: {
      dotClassName: 'bg-rose-500',
      badgeClassName:
        'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300',
      label: 'High',
    },
    medium: {
      dotClassName: 'bg-amber-500',
      badgeClassName:
        'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      label: 'Medium',
    },
    low: {
      dotClassName: 'bg-emerald-500',
      badgeClassName:
        'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
      label: 'Low',
    },
  }

  const formatReminderDateTime = (value: string) => {
    const parsedDate = new Date(value)
    if (Number.isNaN(parsedDate.getTime())) return value
    return parsedDate.toLocaleString(displayLocale, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  useEffect(() => {
    if (reminders.length === 0) return

    const currentDate = new Date()

    reminders
      .filter((reminder) => !reminder.completed)
      .forEach((reminder) => {
        const reminderDate = new Date(reminder.dueAt)
        if (Number.isNaN(reminderDate.getTime())) {
          return
        }
        const hoursUntil =
          (reminderDate.getTime() - currentDate.getTime()) / 3600000

        if (hoursUntil >= 0 && hoursUntil <= 24) {
          addNotification({
            type: 'info',
            title: 'Reminder due soon',
            message: `${reminder.title} is due within 24 hours.`,
            category: 'reminder',
            showToast: false,
            dedupeKey: `reminder-upcoming-${reminder.id}-${reminder.dueAt}`,
            throttleMinutes: 360,
          })
        }

        if (hoursUntil < 0 && Math.abs(hoursUntil) <= 24) {
          addNotification({
            type: 'warning',
            title: 'Reminder overdue',
            message: `${reminder.title} is overdue.`,
            category: 'reminder',
            showToast: true,
            dedupeKey: `reminder-overdue-${reminder.id}-${reminder.dueAt}`,
            throttleMinutes: 720,
          })
        }
      })
  }, [reminders, addNotification])

  return (
    <Card
      className={`bg-card/90 border border-border/70 shadow-sm ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              Reminders
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Stay ahead of bills, goals, and recurring tasks.
            </p>
          </div>
          {action && <div className="flex items-center">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Upcoming Reminders */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground/90">Upcoming</h4>

          {upcomingReminders.length > 0 ? (
            upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={
                  'flex items-center justify-between rounded-xl border ' +
                  'border-border/50 bg-card/70 p-3 shadow-sm transition-colors ' +
                  'hover:bg-muted/30'
                }
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-2 w-2 rounded-full ${priorityStyles[reminder.priority].dotClassName}`}
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {reminder.title}
                      </p>
                      <span
                        className={
                          'rounded-full border px-2 py-0.5 text-[10px] ' +
                          `font-semibold uppercase tracking-[0.14em] ${priorityStyles[reminder.priority].badgeClassName}`
                        }
                      >
                        {priorityStyles[reminder.priority].label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatReminderDateTime(reminder.dueAt)}
                    </p>
                    {reminder.description ? (
                      <p className="text-xs text-muted-foreground/90">
                        {reminder.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                {onToggleReminder && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleReminder(reminder.id)}
                    className={
                      'h-7 px-2.5 text-xs font-semibold text-emerald-700 ' +
                      'hover:bg-emerald-50/70 dark:text-emerald-300 ' +
                      'dark:hover:bg-emerald-500/10'
                    }
                  >
                    Done
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div
              className={
                'rounded-xl border border-dashed border-border/60 bg-muted/10 ' +
                'px-4 py-6 text-center'
              }
            >
              <p className="text-sm font-medium text-foreground">
                No upcoming reminders
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a reminder to keep tasks on track.
              </p>
            </div>
          )}
        </div>

        {/* Completed Reminders */}
        {completedReminders.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border/60">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground/90">
                Completed
              </h4>
              {onClearCompletedReminders ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearCompletedReminders}
                  disabled={isClearingCompleted}
                  className={
                    'h-7 px-2.5 text-xs font-semibold text-rose-700 ' +
                    'hover:bg-rose-50/70 dark:text-rose-300 ' +
                    'dark:hover:bg-rose-500/10'
                  }
                >
                  {isClearingCompleted ? 'Clearing...' : 'Clear completed'}
                </Button>
              ) : null}
            </div>
            {completedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={
                  'flex items-center justify-between rounded-xl border ' +
                  'border-border/50 bg-card/70 p-3 shadow-sm'
                }
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground/80 line-through">
                      {reminder.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatReminderDateTime(reminder.dueAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
