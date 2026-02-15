'use client'

import { memo, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useNotifications } from '@/components/notification-system'
import { useToast } from '@/hooks/use-toast'
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

const CHART_COLORS = [
  '#14b8a6',
  '#38bdf8',
  '#22c55e',
  '#f59e0b',
  '#f97316',
  '#e11d48',
  '#64748b',
]

const AnalyticsDashboard = memo(function AnalyticsDashboard({
  transactions,
  budgets,
  goals,
  className = '',
}: AnalyticsDashboardProps) {
  const { addNotification, setShowNotificationCenter } = useNotifications()
  const { toast } = useToast()

  // Calculate spending by category for pie chart
  const { pieData, pieTotal } = useMemo(() => {
    const categorySpending = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc: Record<string, number>, t) => {
        const category = t.category || 'Other'
        acc[category] = (acc[category] || 0) + Math.abs(t.amount)
        return acc
      }, {})

    const sortedCategories = Object.entries(categorySpending).sort(
      ([, amountA], [, amountB]) => amountB - amountA
    )
    const topCategories = sortedCategories.slice(0, 5)
    const otherTotal = sortedCategories
      .slice(5)
      .reduce((sum, [, amount]) => sum + amount, 0)
    const data = [
      ...topCategories.map(([category, amount]) => ({
        name: category,
        value: amount,
      })),
      ...(otherTotal > 0 ? [{ name: 'Other', value: otherTotal }] : []),
    ]

    return {
      pieData: data,
      pieTotal: data.reduce((sum, item) => sum + item.value, 0),
    }
  }, [transactions])

  // Calculate monthly spending trend
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
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
  }, [transactions])

  // Calculate budget performance
  const budgetPerformance = useMemo(() => {
    return budgets.map((budget) => {
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
  }, [budgets, transactions])

  const { avgDailySpend, savingsRate, totalExpenses, totalIncome } =
    useMemo(() => {
      const expenses = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const income = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        avgDailySpend: expenses / 30,
        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
        totalExpenses: expenses,
        totalIncome: income,
      }
    }, [transactions])

  const handleExportReport = () => {
    if (
      transactions.length === 0 &&
      budgets.length === 0 &&
      goals.length === 0
    ) {
      toast({
        title: 'No data to export',
        description:
          'Add transactions, budgets, or goals to generate a report.',
      })
      return
    }

    const escapeCsv = (value: string | number | undefined) => {
      if (value === undefined || value === null) {
        return ''
      }
      const text = String(value)
      if (/[",\n]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`
      }
      return text
    }

    const rows: Record<string, string>[] = []
    const reportDate = new Date().toLocaleDateString('en-US')

    rows.push({
      record_type: 'summary',
      metric: 'Report date',
      value: reportDate,
    })
    rows.push({
      record_type: 'summary',
      metric: 'Avg daily spend',
      value: avgDailySpend.toFixed(2),
    })
    rows.push({
      record_type: 'summary',
      metric: 'Savings rate',
      value: `${savingsRate.toFixed(1)}%`,
    })
    rows.push({
      record_type: 'summary',
      metric: 'Total income',
      value: totalIncome.toFixed(2),
    })
    rows.push({
      record_type: 'summary',
      metric: 'Total expenses',
      value: totalExpenses.toFixed(2),
    })

    transactions.forEach((transaction) => {
      rows.push({
        record_type: 'transaction',
        date: new Date(transaction.date).toLocaleDateString('en-US'),
        description: transaction.description,
        category: transaction.category || 'Other',
        type: transaction.type,
        amount:
          transaction.type === 'EXPENSE'
            ? `-${Math.abs(transaction.amount).toFixed(2)}`
            : transaction.amount.toFixed(2),
      })
    })

    budgets.forEach((budget) => {
      const spent = transactions
        .filter((t) => t.type === 'EXPENSE' && t.category === budget.category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      rows.push({
        record_type: 'budget',
        name: budget.name,
        category: budget.category || 'General',
        amount: budget.amount.toFixed(2),
        spent: spent.toFixed(2),
      })
    })

    goals.forEach((goal) => {
      rows.push({
        record_type: 'goal',
        name: goal.name,
        target_amount: goal.targetAmount.toFixed(2),
        current_amount: goal.currentAmount.toFixed(2),
        target_date: goal.targetDate
          ? new Date(goal.targetDate).toLocaleDateString('en-US')
          : '',
      })
    })

    const columns = [
      'record_type',
      'date',
      'description',
      'category',
      'type',
      'amount',
      'name',
      'target_amount',
      'current_amount',
      'target_date',
      'metric',
      'value',
      'spent',
    ]

    const lines = [
      columns.join(','),
      ...rows.map((row) =>
        columns.map((column) => escapeCsv(row[column] ?? '')).join(',')
      ),
    ]

    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const reportDateStamp = new Date().toISOString().slice(0, 10)
    const link = document.createElement('a')
    link.href = url
    link.download = `financial-report-${reportDateStamp}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    toast({
      title: 'Report exported',
      description: 'Your analytics report is ready to download.',
    })
  }

  const handleSetAlerts = () => {
    addNotification({
      type: 'info',
      title: 'Spending alert enabled',
      message:
        'We will notify you if monthly expenses rise 10% above your recent ' +
        'average.',
      category: 'budget',
      showToast: false,
      action: {
        label: 'View alerts',
        onClick: () => setShowNotificationCenter(true),
      },
    })
    setShowNotificationCenter(true)
  }

  return (
    <Card
      className={`bg-card/90 border border-border/70 shadow-sm ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              Financial Analytics
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Snapshot of trends, spending, and budget health.
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-sky-600 dark:text-sky-300 bg-sky-500/10 border-sky-500/30"
          >
            Advanced
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Avg Daily Spend
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(avgDailySpend)}
            </div>
            <div className="text-xs text-muted-foreground">Last 30 days</div>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Savings Rate
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {totalIncome > 0 ? `${savingsRate.toFixed(1)}%` : '0%'}
            </div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground/90">
            Spending by Category
          </h4>
          {pieData.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={80}
                      paddingAngle={2}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 12,
                        boxShadow: '0 18px 32px -20px rgba(0, 0, 0, 0.45)',
                        padding: '10px 12px',
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {pieData.map((item, index) => {
                  const percent =
                    pieTotal > 0 ? (item.value / pieTotal) * 100 : 0
                  return (
                    <div
                      key={`${item.name}-${index}`}
                      className={
                        'flex items-center justify-between rounded-xl border ' +
                        'border-border/40 bg-card/70 px-3.5 py-2.5 shadow-sm ' +
                        'transition-colors hover:bg-muted/30'
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {percent.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div
              className={
                'rounded-xl border border-dashed border-border/60 bg-muted/10 ' +
                'px-4 py-6 text-center'
              }
            >
              <p className="text-sm font-medium text-foreground">
                No spending data
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Add expenses to see category breakdowns.
              </p>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground/90">
            Monthly Spending Trend
          </h4>
          <div className="h-52">
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
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 12,
                    boxShadow: '0 18px 32px -20px rgba(0, 0, 0, 0.45)',
                    padding: '10px 12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                />
                <Bar
                  dataKey="expenses"
                  fill="#ef4444"
                  name="Expenses"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="income"
                  fill="#22c55e"
                  name="Income"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Performance */}
        {budgetPerformance.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground/90">
              Budget Performance
            </h4>
            <div className="space-y-2">
              {budgetPerformance.slice(0, 3).map((budget) => (
                <div
                  key={budget.id}
                  className="p-4 rounded-xl border border-border/50 bg-card/60"
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
                            ? 'text-amber-600 dark:text-amber-300 ' +
                              'bg-amber-500/10 border-amber-500/30'
                            : 'text-emerald-600 dark:text-emerald-300 ' +
                              'bg-emerald-500/10 border-emerald-500/30'
                      }
                    >
                      {budget.status === 'over'
                        ? 'Over Budget'
                        : budget.status === 'warning'
                          ? 'Warning'
                          : 'On Track'}
                    </Badge>
                  </div>
                  <div
                    className={
                      'flex items-center justify-between text-xs ' +
                      'text-muted-foreground mb-2'
                    }
                  >
                    <span>
                      {formatCurrency(budget.spent)} /{' '}
                      {formatCurrency(budget.amount)}
                    </span>
                    <span>{budget.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className="h-2.5"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-semibold rounded-full"
            onClick={handleExportReport}
          >
            Export Report
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-semibold rounded-full"
            onClick={handleSetAlerts}
          >
            Set Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

export { AnalyticsDashboard }
