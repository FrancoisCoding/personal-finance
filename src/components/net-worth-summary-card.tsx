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
  forecastHeights?: number[]
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
  forecastHeights,
  forecastAverage,
  forecastProjected,
  hasData = true,
  className,
}: INetWorthSummaryCardProps) {
  const shouldShowChange =
    hasData && changePercent !== undefined && changePercent !== 0
  const isChangePositive = (changePercent ?? 0) >= 0
  const ChangeIcon = isChangePositive ? TrendingUp : TrendingDown
  const hasForecast = Boolean(forecastHeights && forecastHeights.length > 0)
  const forecastColumnCount = forecastHeights?.length ?? 0
  const averageHeight = hasForecast
    ? forecastHeights!.reduce((sum, value) => sum + value, 0) /
      forecastHeights!.length
    : 0

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
              <div className="relative mt-4 h-24">
                <div
                  className="grid h-full items-end gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${forecastColumnCount}, minmax(0, 1fr))`,
                  }}
                >
                  {forecastHeights?.map((height, index) => (
                    <div
                      key={`forecast-bar-${index}`}
                      className={
                        'rounded-full bg-gradient-to-t from-emerald-500/80 ' +
                        'via-emerald-400/70 to-cyan-400/70'
                      }
                      style={{
                        height: `${Math.min(Math.max(height, 0), 100)}%`,
                        opacity: index === forecastHeights.length - 1 ? 1 : 0.85,
                      }}
                    />
                  ))}
                </div>
                <div
                  className={
                    'pointer-events-none absolute left-0 right-0 border-t ' +
                    'border-dashed border-emerald-400/40'
                  }
                  style={{
                    bottom: `${Math.min(Math.max(averageHeight, 0), 100)}%`,
                  }}
                />
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
