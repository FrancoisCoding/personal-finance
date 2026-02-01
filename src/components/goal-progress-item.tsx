'use client'

import { Progress } from '@/components/ui/progress'
import { useGoalProgress } from '@/hooks/use-finance-data'
import { formatCurrency } from '@/lib/utils'

interface GoalProgressItemProps {
  goal: {
    id: string
    name: string
    currentAmount: number
    targetAmount: number
  }
}

export function GoalProgressItem({ goal }: GoalProgressItemProps) {
  const progress = useGoalProgress(goal.id)

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-background/80 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{goal.name}</span>
        <span className="text-xs font-semibold text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-1.5" />
      <p className="text-xs text-muted-foreground">
        {formatCurrency(goal.currentAmount)} /{' '}
        {formatCurrency(goal.targetAmount)}
      </p>
    </div>
  )
}
