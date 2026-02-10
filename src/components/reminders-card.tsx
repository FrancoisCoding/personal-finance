import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
  onAddReminder?: () => void
  onToggleReminder?: (id: string) => void
  className?: string
}

export function RemindersCard({
  reminders,
  onAddReminder,
  onToggleReminder,
  className = '',
}: RemindersCardProps) {
  const upcomingReminders = reminders.filter((r) => !r.completed).slice(0, 3)
  const completedReminders = reminders.filter((r) => r.completed).slice(0, 2)

  return (
    <Card
      className={`bg-card/80 border border-border/60 shadow-sm ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Reminders
          </CardTitle>
          {onAddReminder && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddReminder}
              className="h-8 px-3 text-xs font-medium text-blue-700 hover:bg-blue-50/50 dark:text-blue-300 dark:hover:bg-blue-500/10"
            >
              Add
            </Button>
          )}
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
                className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/30 hover:bg-muted/40 transition-colors"
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
                    className="h-6 px-2 text-xs font-medium text-green-700 hover:bg-green-50/50 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                  >
                    Done
                  </Button>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
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
                className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/30"
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

        {/* Quick Add Reminder */}
        {onAddReminder && (
          <div className="pt-4 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddReminder}
              className="w-full border-dashed border-border/70 hover:border-blue-200/60 hover:bg-blue-50/40 dark:hover:border-blue-400/40 dark:hover:bg-blue-500/10"
            >
              Add Reminder
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
