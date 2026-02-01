'use client'

import { Progress } from '@/components/ui/progress'
import { useBudgetProgress } from '@/hooks/use-finance-data'

interface BudgetProgressItemProps {
  budget: {
    id: string
    name: string
  }
}

export function BudgetProgressItem({ budget }: BudgetProgressItemProps) {
  const progress = useBudgetProgress(budget.id)

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-background/80 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          {budget.name}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-1.5" />
    </div>
  )
}
