import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface FinancialOverviewCardsProps {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  netIncome: number
  creditCardUtilization: number
  previousMonthIncome?: number
  previousMonthExpenses?: number
  className?: string
}

export function FinancialOverviewCards({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  netIncome,
  creditCardUtilization,
  previousMonthIncome = 0,
  previousMonthExpenses = 0,
  className = '',
}: FinancialOverviewCardsProps) {
  const incomeChange =
    previousMonthIncome > 0
      ? ((monthlyIncome - previousMonthIncome) / previousMonthIncome) * 100
      : 0
  const expensesChange =
    previousMonthExpenses > 0
      ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) *
        100
      : 0

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {/* Total Balance */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-gray-600 mt-1">Across all accounts</p>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Monthly Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(monthlyIncome)}
          </div>
          {incomeChange !== 0 && (
            <p
              className={`text-xs mt-1 ${incomeChange > 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {incomeChange > 0 ? 'Up' : 'Down'}{' '}
              {Math.abs(incomeChange).toFixed(1)}% from last month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card className="bg-gradient-to-br from-red-50 to-rose-100 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Monthly Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(monthlyExpenses)}
          </div>
          {expensesChange !== 0 && (
            <p
              className={`text-xs mt-1 ${expensesChange < 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {expensesChange < 0 ? 'Down' : 'Up'}{' '}
              {Math.abs(expensesChange).toFixed(1)}% from last month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Net Income */}
      <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Net Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {formatCurrency(netIncome)}
          </div>
          <p className="text-xs text-gray-600 mt-1">This month</p>
        </CardContent>
      </Card>

      {/* Credit Utilization */}
      <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Credit Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              creditCardUtilization < 30
                ? 'text-green-600'
                : creditCardUtilization < 70
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }`}
          >
            {creditCardUtilization.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-600 mt-1">Credit cards</p>
        </CardContent>
      </Card>

      {/* Savings Rate */}
      <Card className="bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-slate-900 dark:to-slate-800/70 border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Savings Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              netIncome > 0 && monthlyIncome > 0
                ? (netIncome / monthlyIncome) * 100 >= 20
                  ? 'text-green-600'
                  : 'text-yellow-600'
                : 'text-gray-600'
            }`}
          >
            {monthlyIncome > 0
              ? ((netIncome / monthlyIncome) * 100).toFixed(1)
              : '0'}
            %
          </div>
          <p className="text-xs text-gray-600 mt-1">Of income saved</p>
        </CardContent>
      </Card>
    </div>
  )
}
