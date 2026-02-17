import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
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

const normalizeHexColor = (color: string) => {
  const normalized = color.trim().toLowerCase()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(normalized)) {
    return null
  }
  if (normalized.length === 4) {
    const r = normalized[1]
    const g = normalized[2]
    const b = normalized[3]
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return normalized
}

const hexToRgb = (hexColor: string) => {
  const normalized = normalizeHexColor(hexColor)
  if (!normalized) return null
  const red = parseInt(normalized.slice(1, 3), 16)
  const green = parseInt(normalized.slice(3, 5), 16)
  const blue = parseInt(normalized.slice(5, 7), 16)
  return { red, green, blue }
}

const getColorDistance = (firstHex: string, secondHex: string) => {
  const first = hexToRgb(firstHex)
  const second = hexToRgb(secondHex)
  if (!first || !second) return 0
  const redDiff = first.red - second.red
  const greenDiff = first.green - second.green
  const blueDiff = first.blue - second.blue
  return Math.sqrt(redDiff ** 2 + greenDiff ** 2 + blueDiff ** 2)
}

const SpendingChart = memo(function SpendingChart({
  data,
  totalSpending,
  previousMonthTotal,
  className = '',
}: SpendingChartProps) {
  const highContrastPalette = [
    '#84cc16',
    '#3b82f6',
    '#f97316',
    '#a855f7',
    '#ef4444',
    '#06b6d4',
    '#eab308',
    '#14b8a6',
    '#f43f5e',
    '#6366f1',
  ]
  const minimumColorDistance = 90

  const sortedData = [...data].sort((a, b) => b.amount - a.amount)
  const topItems = sortedData.slice(0, 4)
  const remainingTotal = sortedData
    .slice(4)
    .reduce((sum, item) => sum + item.amount, 0)
  const totalAmount = sortedData.reduce((sum, item) => sum + item.amount, 0)
  const preliminaryData = [
    ...topItems,
    ...(remainingTotal > 0
      ? [
          {
            category: 'Other',
            amount: remainingTotal,
            percentage:
              totalAmount > 0 ? (remainingTotal / totalAmount) * 100 : 0,
            color: '#94a3b8',
          },
        ]
      : []),
  ].map((item) => ({
    ...item,
    percentage: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
  }))

  const assignedColors: string[] = []
  let paletteIndex = 0
  const displayData = preliminaryData.map((item) => {
    const normalizedIncomingColor = normalizeHexColor(item.color)
    const isIncomingColorDistinct =
      normalizedIncomingColor &&
      normalizedIncomingColor !== '#9ca3af' &&
      assignedColors.every(
        (existingColor) =>
          getColorDistance(normalizedIncomingColor, existingColor) >=
          minimumColorDistance
      )

    if (normalizedIncomingColor && isIncomingColorDistinct) {
      assignedColors.push(normalizedIncomingColor)
      return { ...item, color: normalizedIncomingColor }
    }

    while (
      assignedColors.length < highContrastPalette.length &&
      assignedColors.some(
        (existingColor) =>
          getColorDistance(
            highContrastPalette[paletteIndex % highContrastPalette.length],
            existingColor
          ) < minimumColorDistance
      )
    ) {
      paletteIndex += 1
    }

    const uniqueColor =
      highContrastPalette[paletteIndex % highContrastPalette.length]
    paletteIndex += 1
    assignedColors.push(uniqueColor)
    return { ...item, color: uniqueColor }
  })

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
      <CardContent className="space-y-6">
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
                  'flex flex-col gap-2 rounded-lg border border-border/60 ' +
                  'bg-muted/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between'
                }
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
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
                <div className="shrink-0 text-left sm:min-w-[96px] sm:text-right">
                  <p className="text-sm font-semibold text-foreground tabular-nums">
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
})

export { SpendingChart }
