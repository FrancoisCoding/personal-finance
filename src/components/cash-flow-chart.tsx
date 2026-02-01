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

export function CashFlowChart({ data, className = '' }: CashFlowChartProps) {
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0)
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0)
  const netCashFlow = totalIncome - totalExpenses

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; payload: { date: string; income: number; expenses: number } }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-green-600">
            Income: {formatCurrency(payload[0]?.value || 0)}
          </p>
          <p className="text-sm text-red-600">
            Expenses: {formatCurrency(payload[1]?.value || 0)}
          </p>
          <p className="text-sm text-blue-600">
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
      className={`bg-gradient-to-br from-white to-green-50/30 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-700">
            Cash Flow
          </CardTitle>
          <div className="text-right">
            <div
              className={`text-lg font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(netCashFlow)}
            </div>
            <div className="text-xs text-gray-500">Net cash flow</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg border border-green-200/60 bg-green-50/40">
              <div className="text-lg font-bold text-green-700">
                {formatCurrency(totalIncome)}
              </div>
              <div className="text-xs text-gray-500">Total Income</div>
            </div>
            <div className="text-center p-3 rounded-lg border border-red-200/60 bg-red-50/40">
              <div className="text-lg font-bold text-red-700">
                {formatCurrency(totalExpenses)}
              </div>
              <div className="text-xs text-gray-500">Total Expenses</div>
            </div>
            <div className="text-center p-3 rounded-lg border border-blue-200/60 bg-blue-50/40">
              <div
                className={`text-lg font-bold ${netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}
              >
                {formatCurrency(netCashFlow)}
              </div>
              <div className="text-xs text-gray-500">Net Flow</div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
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
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Expenses</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
