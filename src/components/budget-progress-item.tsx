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
    <div className="space-y-2.5 rounded-xl border border-border/50 bg-card/70 p-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-foreground">
          {budget.name}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
