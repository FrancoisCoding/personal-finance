'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
// Simplified types that match what the hooks return
interface SimpleTransaction {
  id: string
  description: string
  amount: number
  category?: string
  date: string | Date
  type: string
}

interface SimpleBudget {
  id: string
  name: string
  amount: number
  category?: string
}

interface SimpleGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string | Date
}

interface AnalyticsDashboardProps {
  transactions: SimpleTransaction[]
  budgets: SimpleBudget[]
  goals: SimpleGoal[]
  className?: string
}

export function AnalyticsDashboard({
  transactions,
  budgets,
  goals,
  className = '',
}: AnalyticsDashboardProps) {
  // Calculate spending by category for pie chart
  const categorySpending = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc: Record<string, number>, t) => {
      const category = t.category || 'Other'
      acc[category] = (acc[category] || 0) + Math.abs(t.amount)
      return acc
    }, {})

  const pieData = Object.entries(categorySpending).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  )

  // Calculate monthly spending trend
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthTransactions = transactions.filter((t) => {
      const tDate = new Date(t.date)
      return (
        tDate.getMonth() === date.getMonth() &&
        tDate.getFullYear() === date.getFullYear()
      )
    })

    const expenses = monthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const income = monthTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      expenses,
      income,
      net: income - expenses,
    }
  }).reverse()

  // Calculate budget performance
  const budgetPerformance = budgets.map((budget) => {
    const spent = transactions
      .filter((t) => t.type === 'EXPENSE' && t.category === budget.category)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const percentage = (spent / budget.amount) * 100
    const status =
      percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'

    return {
      ...budget,
      spent,
      percentage,
      status,
    }
  })

  // Calculate goal progress
  const goalProgress = goals.map((goal) => {
    const saved =
      transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0) -
      transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const percentage = Math.min((saved / goal.targetAmount) * 100, 100)
    const status =
      percentage >= 100 ? 'completed' : percentage > 50 ? 'on_track' : 'behind'

    return {
      ...goal,
      saved,
      percentage,
      status,
    }
  })

  const COLORS = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff7300',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
  ]

  return (
    <Card className={`bg-card/80 border border-border/60 shadow-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Financial Analytics
          </CardTitle>
          <Badge
            variant="outline"
            className="text-sky-600 dark:text-sky-300 bg-sky-500/10 border-sky-500/30"
          >
            Advanced
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Avg Daily Spend
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(
                transactions
                  .filter((t) => t.type === 'EXPENSE')
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 30
              )}
            </div>
            <div className="text-xs text-muted-foreground">Last 30 days</div>
          </div>
          <div className="p-4 rounded-lg border border-border/60 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Savings Rate
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {(() => {
                const income = transactions
                  .filter((t) => t.type === 'INCOME')
                  .reduce((sum, t) => sum + t.amount, 0)
                const expenses = transactions
                  .filter((t) => t.type === 'EXPENSE')
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                return income > 0
                  ? `${(((income - expenses) / income) * 100).toFixed(1)}%`
                  : '0%'
              })()}
            </div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Spending by Category
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Monthly Spending Trend
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={0.25}
                />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Bar dataKey="income" fill="#22c55e" name="Income" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Performance */}
        {budgetPerformance.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Budget Performance
            </h4>
            <div className="space-y-2">
              {budgetPerformance.slice(0, 3).map((budget) => (
                <div
                  key={budget.id}
                  className="p-3 rounded-lg border border-border/60 bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {budget.category}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        budget.status === 'over'
                          ? 'text-rose-600 dark:text-rose-300 bg-rose-500/10 border-rose-500/30'
                          : budget.status === 'warning'
                            ? 'text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/30'
                            : 'text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
                      }
                    >
                      {budget.status === 'over'
                        ? 'Over Budget'
                        : budget.status === 'warning'
                          ? 'Warning'
                          : 'On Track'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>
                      {formatCurrency(budget.spent)} /{' '}
                      {formatCurrency(budget.amount)}
                    </span>
                    <span>{budget.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            Export Report
          </Button>
          <Button variant="outline" size="sm" className="text-xs">
            Set Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
