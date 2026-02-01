'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Plus,
  TrendingDown,
  DollarSign,
  Settings,
  Target,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import {
  formatCurrency,
  calculatePercentage,
  getCategoryColor,
  getCategoryIcon,
} from '@/lib/utils'
import {
  useBudgets,
  useCreateBudget,
  useCategories,
} from '@/hooks/use-finance-data'
import { CreateBudgetModal } from '@/components/budgets/create-budget-modal'
import type { Budget } from '@/hooks/use-finance-data'

export default function BudgetsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data: budgets = [], isLoading } = useBudgets()
  const { data: categories = [] } = useCategories()
  const createBudgetMutation = useCreateBudget()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  )

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  // Calculate budget progress and spending
  const getBudgetProgress = (budget: Budget) => {
    // TODO: Implement transaction filtering for budget progress
    const spent = 0 // Placeholder - need to implement transaction filtering
    const percentage = calculatePercentage(spent, budget.amount)
    const remaining = budget.amount - spent

    return { spent, percentage, remaining, isOverBudget: spent > budget.amount }
  }

  // Get budget status
  const getBudgetStatus = (budget: Budget) => {
    const { spent, percentage, isOverBudget } = getBudgetProgress(budget)

    if (isOverBudget) {
      return {
        status: 'over',
        icon: AlertTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-200/40',
      }
    } else if (percentage >= 80) {
      return {
        status: 'warning',
        icon: AlertTriangle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-200/40',
      }
    } else {
      return {
        status: 'good',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-200/40',
      }
    }
  }

  // Handle budget creation
  const handleCreateBudget = (budgetData: {
    name: string
    amount: number
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    categoryId?: string
    startDate: Date
    endDate?: Date
    isRecurring: boolean
  }) => {
    createBudgetMutation.mutate(budgetData, {
      onSuccess: () => {
        setShowCreateModal(false)
      },
    })
  }

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => {
    const { spent } = getBudgetProgress(b)
    return sum + spent
  }, 0)
  const totalRemaining = totalBudgeted - totalSpent
  const overallPercentage = calculatePercentage(totalSpent, totalBudgeted)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set spending limits and track your budget progress with smart
            notifications
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Overall Budget Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Budgeted
            </CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalBudgeted)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {budgets.length} budgets
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {overallPercentage.toFixed(1)}% of total budget
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {formatCurrency(totalRemaining)}
            </div>
            <Progress value={overallPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Budgets List */}
      <div className="grid gap-6">
        {budgets.length === 0 ? (
          <Card>
            <CardContent>
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
                <p className="text-sm font-medium text-foreground">
                  No budgets yet
                </p>
                <p className="text-xs text-muted-foreground mt-1 mb-5">
                  Create your first budget to start tracking your spending.
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Budget
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => {
            const { spent, percentage, remaining, isOverBudget } =
              getBudgetProgress(budget)
            const { status } = getBudgetStatus(budget)
            const category =
              categoryMap.get(budget.categoryId ?? '') ?? undefined
            const categoryName = category?.name ?? 'General'
            const categoryColor = getCategoryColor(categoryName)
            const categoryIcon = getCategoryIcon(categoryName)
            const statusLabel =
              status === 'over'
                ? 'Over budget'
                : status === 'warning'
                  ? 'Approaching limit'
                  : 'On track'
            const statusBadgeClass =
              status === 'over'
                ? 'border-red-200/60 bg-red-50/60 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300'
                : status === 'warning'
                  ? 'border-amber-200/60 bg-amber-50/60 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                  : 'border-emerald-200/60 bg-emerald-50/60 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300'

            return (
              <Card
                key={budget.id}
                className="border-border/60 bg-card/80 shadow-sm"
              >
                <CardHeader className="space-y-3">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full border"
                        style={{
                          color: categoryColor,
                          backgroundColor: `${categoryColor}1A`,
                          borderColor: `${categoryColor}33`,
                        }}
                      >
                        <span className="text-lg">{categoryIcon}</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl">{budget.name}</CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2 text-xs">
                          <span>{categoryName}</span>
                          <span className="text-muted-foreground">-</span>
                          <span className="capitalize">
                            {budget.period.toLowerCase()} budget
                          </span>
                          {budget.isRecurring && (
                            <Badge
                              variant="outline"
                              className="border-blue-200/60 bg-blue-50/50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300"
                            >
                              Recurring
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusBadgeClass}>
                        {statusLabel}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Spent</span>
                    <span
                      className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-foreground'}`}
                    >
                      {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(percentage, 100)}
                    className={`h-2 ${isOverBudget ? 'bg-red-100/60' : ''}`}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(budget.amount)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Spent</p>
                      <p
                        className={`text-lg font-semibold ${isOverBudget ? 'text-red-600' : ''}`}
                      >
                        {formatCurrency(spent)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-center">
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p
                        className={`text-lg font-semibold ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}
                      >
                        {formatCurrency(Math.abs(remaining))}
                        {remaining < 0 && ' over'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`rounded-lg border p-3 text-sm font-medium ${
                      status === 'over'
                        ? 'border-red-200/60 bg-red-50/50 text-red-700'
                        : status === 'warning'
                          ? 'border-amber-200/60 bg-amber-50/50 text-amber-700'
                          : 'border-emerald-200/60 bg-emerald-50/50 text-emerald-700'
                    }`}
                  >
                    {status === 'over' &&
                      `Over budget by ${formatCurrency(Math.abs(remaining))}.`}
                    {status === 'warning' &&
                      `Approaching limit with ${formatCurrency(remaining)} remaining.`}
                    {status === 'good' &&
                      `On track with ${formatCurrency(remaining)} remaining.`}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Create Budget Modal */}
      <CreateBudgetModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateBudget}
        isLoading={createBudgetMutation.isPending}
        categories={categories}
      />
    </div>
  )
}
