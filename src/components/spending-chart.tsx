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
  const changePercent =
    previousMonthTotal > 0
      ? ((totalSpending - previousMonthTotal) / previousMonthTotal) * 100
      : 0
  const isPositive = changePercent <= 0

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: SpendingData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.category}</p>
          <p className="text-sm text-gray-600">{formatCurrency(data.amount)}</p>
          <p className="text-xs text-gray-500">{data.percentage.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card
      className={`bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-700">
            Spending Breakdown
          </CardTitle>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(totalSpending)}
            </div>
            <div
              className={`flex items-center space-x-1 text-sm ${
                isPositive ? 'text-green-600' : 'text-red-600'
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
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="amount"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-600">Categories</h4>
            {data.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.category}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.percentage.toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
