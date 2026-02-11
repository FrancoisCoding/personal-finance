// packages
import { TrendingDown, TrendingUp } from 'lucide-react'

// utils
import { cn, formatCurrency } from '@/lib/utils'

/** Summary item shown under the net worth headline. */
export interface INetWorthSummaryItem {
  label: string
  value: number
}

/** Props for the NetWorthSummaryCard component. */
export interface INetWorthSummaryCardProps {
  netWorth: number
  changePercent?: number
  summaryItems: INetWorthSummaryItem[]
  forecastRange?: {
    low: number
    typical: number
    high: number
  }
  forecastAverage?: number
  forecastProjected?: number
  hasData?: boolean
  className?: string
}

/** Net worth overview card with summary metrics and forecast visualization. */
export function NetWorthSummaryCard({
  netWorth,
  changePercent,
  summaryItems,
  forecastRange,
  forecastAverage,
  forecastProjected,
  hasData = true,
  className,
}: INetWorthSummaryCardProps) {
  const shouldShowChange =
    hasData && changePercent !== undefined && changePercent !== 0
  const isChangePositive = (changePercent ?? 0) >= 0
  const ChangeIcon = isChangePositive ? TrendingUp : TrendingDown
  const hasForecast =
    Boolean(forecastRange) &&
    Boolean(
      forecastRange &&
        (forecastRange.low > 0 ||
          forecastRange.typical > 0 ||
          forecastRange.high > 0)
    )
  const safeForecastRange = forecastRange ?? {
    low: 0,
    typical: 0,
    high: 0,
  }

  return (
    <div
      className={cn(
        'relative rounded-[28px] border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Net worth
          </p>
          <p className="font-display text-3xl mt-2">
            {hasData ? formatCurrency(netWorth) : '--'}
          </p>
        </div>
        {shouldShowChange && (
          <div
            className={cn(
              'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
              isChangePositive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-300'
            )}
          >
            <ChangeIcon className="h-4 w-4" />
            {isChangePositive ? '+' : '-'}
            {Math.abs(changePercent ?? 0).toFixed(1)}%
          </div>
        )}
      </div>

      {hasData ? (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-border/60 bg-background/70 p-4"
              >
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-lg font-semibold mt-2">
                  {formatCurrency(item.value)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Spending forecast</span>
              <span>Next 30 days</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  7-day avg
                </p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {forecastAverage !== undefined
                    ? formatCurrency(forecastAverage)
                    : '--'}
                </p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/70 px-3 py-2">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Projected month
                </p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  {forecastProjected !== undefined
                    ? formatCurrency(forecastProjected)
                    : '--'}
                </p>
              </div>
            </div>
            {hasForecast ? (
              <div className="mt-4 rounded-2xl border border-border/60 bg-background/60 p-4">
                <div
                  className={
                    'flex items-center justify-between text-[11px] uppercase ' +
                    'tracking-[0.2em] text-muted-foreground'
                  }
                >
                  <span>Daily range</span>
                  <span>Last 30 days</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div
                    className={
                      'rounded-xl border border-border/60 bg-background/80 ' +
                      'p-2 text-center'
                    }
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Low
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {formatCurrency(safeForecastRange.low)}
                    </p>
                  </div>
                  <div
                    className={
                      'rounded-xl border border-border/60 bg-background/80 ' +
                      'p-2 text-center'
                    }
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      Typical
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {formatCurrency(safeForecastRange.typical)}
                    </p>
                  </div>
                  <div
                    className={
                      'rounded-xl border border-border/60 bg-background/80 ' +
                      'p-2 text-center'
                    }
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      High
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {formatCurrency(safeForecastRange.high)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={
                  'mt-3 rounded-2xl border border-dashed border-border/60 ' +
                  'bg-background/60 p-4 text-sm text-muted-foreground'
                }
              >
                No spending history yet.
              </div>
            )}
          </div>
        </>
      ) : (
        <div
          className={
            'mt-6 rounded-2xl border border-dashed border-border/60 ' +
            'bg-background/60 p-4 text-sm text-muted-foreground'
          }
        >
          Connect accounts to see your net worth highlights.
        </div>
      )}
    </div>
  )
}
