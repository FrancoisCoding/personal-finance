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
    <Card
      className={`bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-700">
            Financial Analytics
          </CardTitle>
          <Badge
            variant="outline"
            className="text-blue-600 bg-blue-50/50 border-blue-200/60"
          >
            Advanced
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Avg Daily Spend</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(
                transactions
                  .filter((t) => t.type === 'EXPENSE')
                  .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 30
              )}
            </div>
            <div className="text-xs text-gray-500">Last 30 days</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Savings Rate</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
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
            <div className="text-xs text-gray-500">This month</div>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-600">
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
          <h4 className="text-sm font-medium text-gray-600">
            Monthly Spending Trend
          </h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
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
            <h4 className="text-sm font-medium text-gray-600">
              Budget Performance
            </h4>
            <div className="space-y-2">
              {budgetPerformance.slice(0, 3).map((budget) => (
                <div
                  key={budget.id}
                  className="p-3 bg-white rounded-lg border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {budget.category}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        budget.status === 'over'
                          ? 'text-red-600 bg-red-50/50 border-red-200/60'
                          : budget.status === 'warning'
                            ? 'text-yellow-600 bg-yellow-50/50 border-yellow-200/60'
                            : 'text-green-600 bg-green-50/50 border-green-200/60'
                      }
                    >
                      {budget.status === 'over'
                        ? 'Over Budget'
                        : budget.status === 'warning'
                          ? 'Warning'
                          : 'On Track'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
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
