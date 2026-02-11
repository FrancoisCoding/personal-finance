import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface SpendingData {
  category: string
  amount: number
  percentage: number
  color: string
}

interface SpendingChartProps {
  data: SpendingData[]
  totalSpending: number
  previousMonthTotal: number
  className?: string
}

export function SpendingChart({
  data,
  totalSpending,
  previousMonthTotal,
  className = '',
}: SpendingChartProps) {
  const sortedData = [...data].sort((a, b) => b.amount - a.amount)
  const topItems = sortedData.slice(0, 4)
  const remainingTotal = sortedData
    .slice(4)
    .reduce((sum, item) => sum + item.amount, 0)
  const totalAmount = sortedData.reduce((sum, item) => sum + item.amount, 0)
  const displayData = [
    ...topItems,
    ...(remainingTotal > 0
      ? [
          {
            category: 'Other',
            amount: remainingTotal,
            percentage: totalAmount > 0 ? (remainingTotal / totalAmount) * 100 : 0,
            color: '#94a3b8',
          },
        ]
      : []),
  ].map((item) => ({
    ...item,
    percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
  }))

  const changePercent =
    previousMonthTotal > 0
      ? ((totalSpending - previousMonthTotal) / previousMonthTotal) * 100
      : 0
  const isPositive = changePercent <= 0

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean
    payload?: Array<{ payload: SpendingData }>
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background p-3 border border-border/60 rounded-lg shadow-lg">
          <p className="font-medium text-foreground">{data.category}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(data.amount)}
          </p>
          <p className="text-xs text-muted-foreground">
            {data.percentage.toFixed(1)}%
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
            Spending Breakdown
          </CardTitle>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(totalSpending)}
            </div>
            <div
              className={`flex items-center space-x-1 text-sm ${
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-rose-600 dark:text-rose-300'
              }`}
            >
              <span>
                {isPositive ? 'Down' : 'Up'}{' '}
                {Math.abs(changePercent).toFixed(1)}% vs last month
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-52 sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {displayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Categories
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {displayData.map((item, index) => (
                <div
                  key={`${item.category}-${index}`}
                  className={
                    'flex items-center justify-between rounded-lg border ' +
                    'border-border/60 bg-muted/20 px-3 py-2'
                  }
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground tabular-nums">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
