import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface NetWorthCardProps {
  assets: number
  liabilities: number
  netWorth: number
  changePercent?: number
  className?: string
}

export function NetWorthCard({
  assets,
  liabilities,
  netWorth,
  changePercent = 0,
  className = '',
}: NetWorthCardProps) {
  const isChangePositive = changePercent >= 0
  const totalBalance = assets + liabilities
  const assetsPercent = totalBalance > 0 ? (assets / totalBalance) * 100 : 0
  const liabilitiesPercent =
    totalBalance > 0 ? (liabilities / totalBalance) * 100 : 0
  return (
    <Card className={`bg-card/80 border border-border/60 shadow-sm ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Net Worth
          </CardTitle>
          {changePercent !== 0 && (
            <div
              className={`flex items-center space-x-1 text-xs font-semibold ${
                isChangePositive
                  ? 'text-emerald-600 dark:text-emerald-300'
                  : 'text-rose-600 dark:text-rose-300'
              }`}
            >
              <span>
                {isChangePositive ? 'Up' : 'Down'}{' '}
                {Math.abs(changePercent).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="text-3xl font-bold text-foreground">
            {formatCurrency(netWorth)}
          </div>
          <p className="text-sm text-muted-foreground">
            {totalBalance > 0
              ? 'Assets vs liabilities across connected accounts.'
              : 'Connect accounts to calculate your net worth.'}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Assets
              </span>
              <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                {formatCurrency(assets)}
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Liabilities
              </span>
              <div className="text-lg font-semibold text-rose-600 dark:text-rose-300">
                {formatCurrency(liabilities)}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{assetsPercent.toFixed(0)}% assets</span>
              <span>{liabilitiesPercent.toFixed(0)}% liabilities</span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${Math.min(assetsPercent, 100)}%` }}
              />
              <div
                className="h-full bg-rose-500"
                style={{ width: `${Math.min(liabilitiesPercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
