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
    <div className="space-y-2.5 rounded-xl border border-border/50 bg-card/70 p-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">
          {goal.name}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {formatCurrency(goal.currentAmount)} /{' '}
        {formatCurrency(goal.targetAmount)}
      </p>
    </div>
  )
}
