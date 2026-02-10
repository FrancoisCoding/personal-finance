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
      <Card className="bg-card/80 border border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all accounts
          </p>
        </CardContent>
      </Card>

      {/* Monthly Income */}
      <Card className="bg-card/80 border border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
            {formatCurrency(monthlyIncome)}
          </div>
          {incomeChange !== 0 && (
            <p
              className={`text-xs mt-1 ${incomeChange > 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
            >
              {incomeChange > 0 ? 'Up' : 'Down'}{' '}
              {Math.abs(incomeChange).toFixed(1)}% from last month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Monthly Expenses */}
      <Card className="bg-card/80 border border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Monthly Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-300">
            {formatCurrency(monthlyExpenses)}
          </div>
          {expensesChange !== 0 && (
            <p
              className={`text-xs mt-1 ${expensesChange < 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
            >
              {expensesChange < 0 ? 'Down' : 'Up'}{' '}
              {Math.abs(expensesChange).toFixed(1)}% from last month
            </p>
          )}
        </CardContent>
      </Card>

      {/* Net Income */}
      <Card className="bg-card/80 border border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Income
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'}`}
          >
            {formatCurrency(netIncome)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">This month</p>
        </CardContent>
      </Card>

      {/* Credit Utilization */}
      <Card className="bg-card/80 border border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Credit Utilization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              creditCardUtilization < 30
                ? 'text-emerald-600 dark:text-emerald-300'
                : creditCardUtilization < 70
                  ? 'text-amber-600 dark:text-amber-300'
                  : 'text-rose-600 dark:text-rose-300'
            }`}
          >
            {creditCardUtilization.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground mt-1">Credit cards</p>
        </CardContent>
      </Card>

      {/* Savings Rate */}
      <Card className="bg-card/80 border border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Savings Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${
              netIncome > 0 && monthlyIncome > 0
                ? (netIncome / monthlyIncome) * 100 >= 20
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-amber-600 dark:text-amber-300'
                : 'text-muted-foreground'
            }`}
          >
            {monthlyIncome > 0
              ? ((netIncome / monthlyIncome) * 100).toFixed(1)
              : '0'}
            %
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Of income saved
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
