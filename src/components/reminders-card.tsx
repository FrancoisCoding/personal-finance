'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/components/notification-system'

interface Reminder {
  id: string
  title: string
  date: string
  time: string
  completed: boolean
  type: 'budget' | 'bill' | 'goal' | 'custom'
}

interface RemindersCardProps {
  reminders: Reminder[]
  action?: ReactNode
  onToggleReminder?: (id: string) => void
  className?: string
}

export function RemindersCard({
  reminders,
  action,
  onToggleReminder,
  className = '',
}: RemindersCardProps) {
  const { addNotification } = useNotifications()
  const upcomingReminders = reminders
    .filter((reminder) => !reminder.completed)
    .slice(0, 3)
  const completedReminders = reminders
    .filter((reminder) => reminder.completed)
    .slice(0, 2)

  useEffect(() => {
    if (reminders.length === 0) return

    const currentDate = new Date()

    reminders
      .filter((reminder) => !reminder.completed)
      .forEach((reminder) => {
        const reminderDateTime = new Date(`${reminder.date} ${reminder.time}`)
        const reminderDate = Number.isNaN(reminderDateTime.getTime())
          ? new Date(reminder.date)
          : reminderDateTime
        const hoursUntil =
          (reminderDate.getTime() - currentDate.getTime()) / 3600000

        if (hoursUntil >= 0 && hoursUntil <= 24) {
          addNotification({
            type: 'info',
            title: 'Reminder due soon',
            message: `${reminder.title} is due within 24 hours.`,
            category: 'reminder',
            showToast: false,
            dedupeKey: `reminder-upcoming-${reminder.id}-${reminder.date}`,
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
            dedupeKey: `reminder-overdue-${reminder.id}-${reminder.date}`,
            throttleMinutes: 720,
          })
        }
      })
  }, [reminders, addNotification])

  return (
    <Card
      className={`bg-card/80 border border-border/60 shadow-sm ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Reminders
          </CardTitle>
          {action && <div className="flex items-center">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upcoming Reminders */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Upcoming
          </h4>

          {upcomingReminders.length > 0 ? (
            upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={
                  'flex items-center justify-between rounded-lg border ' +
                  'border-border/60 bg-muted/30 p-3 transition-colors ' +
                  'hover:bg-muted/40'
                }
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {reminder.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reminder.date} at {reminder.time}
                    </p>
                  </div>
                </div>
                {onToggleReminder && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleReminder(reminder.id)}
                    className={
                      'h-6 px-2 text-xs font-medium text-green-700 ' +
                      'hover:bg-green-50/50 dark:text-emerald-300 ' +
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
                'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
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
            <h4 className="text-sm font-medium text-muted-foreground">
              Completed
            </h4>
            {completedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={
                  'flex items-center justify-between rounded-lg border ' +
                  'border-border/60 bg-muted/30 p-3'
                }
              >
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-foreground/80 line-through">
                      {reminder.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {reminder.date} at {reminder.time}
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
