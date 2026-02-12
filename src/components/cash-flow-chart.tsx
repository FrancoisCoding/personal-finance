import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface CashFlowData {
  date: string
  income: number
  expenses: number
  net: number
}

interface CashFlowChartProps {
  data: CashFlowData[]
  className?: string
}

const CashFlowChart = memo(function CashFlowChart({
  data,
  className = '',
}: CashFlowChartProps) {
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0)
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0)
  const netCashFlow = totalIncome - totalExpenses

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: Array<{
      value: number
      payload: { date: string; income: number; expenses: number }
    }>
    label?: string
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border/60 rounded-lg shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-300">
            Income: {formatCurrency(payload[0]?.value || 0)}
          </p>
          <p className="text-sm text-rose-600 dark:text-rose-300">
            Expenses: {formatCurrency(payload[1]?.value || 0)}
          </p>
          <p className="text-sm text-sky-600 dark:text-sky-300">
            Net:{' '}
            {formatCurrency(
              (payload[0]?.value || 0) - (payload[1]?.value || 0)
            )}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card
      className={`bg-card/80 border border-border/60 shadow-sm ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Cash Flow
          </CardTitle>
          <div className="text-right">
            <div
              className={`text-lg font-bold ${netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
            >
              {formatCurrency(netCashFlow)}
            </div>
            <div className="text-xs text-muted-foreground">Net cash flow</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg border border-border/60 bg-muted/30">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-300">
                {formatCurrency(totalIncome)}
              </div>
              <div className="text-xs text-muted-foreground">Total Income</div>
            </div>
            <div className="text-center p-3 rounded-lg border border-border/60 bg-muted/30">
              <div className="text-lg font-bold text-rose-600 dark:text-rose-300">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Expenses
              </div>
            </div>
            <div className="text-center p-3 rounded-lg border border-border/60 bg-muted/30">
              <div
                className={`text-lg font-bold ${netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
              >
                {formatCurrency(netCashFlow)}
              </div>
              <div className="text-xs text-muted-foreground">Net Flow</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={0.25}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Income</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Expenses</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export { CashFlowChart }
