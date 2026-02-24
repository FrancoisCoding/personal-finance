'use client'

import { memo, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNotifications } from '@/components/notification-system'
import { useToast } from '@/hooks/use-toast'
import { getDisplayPreferences } from '@/lib/display-preferences'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
// Simplified types that match what the hooks return
interface SimpleTransaction {
  id: string
  description: string
  amount: number
  category?: string
  date: string | Date
  type: string
}

interface SimpleBudget {
  id: string
  name: string
  amount: number
  category?: string
}

interface SimpleGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string | Date
}

interface AnalyticsDashboardProps {
  transactions: SimpleTransaction[]
  budgets: SimpleBudget[]
  goals: SimpleGoal[]
  className?: string
  compact?: boolean
}

type ReportFrequency = 'Weekly' | 'Monthly'

const CHART_COLORS = [
  '#14b8a6',
  '#38bdf8',
  '#22c55e',
  '#f59e0b',
  '#f97316',
  '#e11d48',
  '#64748b',
]

const reportScheduleStorageKey = 'financeflow.report-schedule'

const weeklyOptions = [
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
] as const

const monthlyOptions = Array.from({ length: 28 }, (_, index) => ({
  label: `${index + 1}`,
  value: `${index + 1}`,
}))

const AnalyticsDashboard = memo(function AnalyticsDashboard({
  transactions,
  budgets,
  goals,
  className = '',
  compact = false,
}: AnalyticsDashboardProps) {
  const { addNotification, setShowNotificationCenter } = useNotifications()
  const { toast } = useToast()
  const displayLocale = getDisplayPreferences().locale
  const [reportSchedule, setReportSchedule] = useState<{
    enabled: boolean
    frequency: ReportFrequency
    day: string
    time: string
  }>({
    enabled: false,
    frequency: 'Monthly',
    day: '1',
    time: '09:00',
  })

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(reportScheduleStorageKey)
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (!parsed || typeof parsed !== 'object') return
      setReportSchedule((prev) => ({ ...prev, ...parsed }))
    } catch (error) {
      console.warn('Failed to load report schedule', error)
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        reportScheduleStorageKey,
        JSON.stringify(reportSchedule)
      )
    } catch (error) {
      console.warn('Failed to persist report schedule', error)
    }
  }, [reportSchedule])

  // Calculate spending by category for pie chart
  const { pieData, pieTotal } = useMemo(() => {
    const categorySpending = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((acc: Record<string, number>, t) => {
        const category = t.category || 'Other'
        acc[category] = (acc[category] || 0) + Math.abs(t.amount)
        return acc
      }, {})

    const sortedCategories = Object.entries(categorySpending).sort(
      ([, amountA], [, amountB]) => amountB - amountA
    )
    const topCategories = sortedCategories.slice(0, 5)
    const otherTotal = sortedCategories
      .slice(5)
      .reduce((sum, [, amount]) => sum + amount, 0)
    const data = [
      ...topCategories.map(([category, amount]) => ({
        name: category,
        value: amount,
      })),
      ...(otherTotal > 0 ? [{ name: 'Other', value: otherTotal }] : []),
    ]

    return {
      pieData: data,
      pieTotal: data.reduce((sum, item) => sum + item.value, 0),
    }
  }, [transactions])

  // Calculate monthly spending trend
  const monthlyData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthTransactions = transactions.filter((t) => {
        const tDate = new Date(t.date)
        return (
          tDate.getMonth() === date.getMonth() &&
          tDate.getFullYear() === date.getFullYear()
        )
      })

      const expenses = monthTransactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const income = monthTransactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        month: date.toLocaleDateString(displayLocale, { month: 'short' }),
        expenses,
        income,
        net: income - expenses,
      }
    }).reverse()
  }, [displayLocale, transactions])

  // Calculate budget performance
  const budgetPerformance = useMemo(() => {
    return budgets.map((budget) => {
      const spent = transactions
        .filter((t) => t.type === 'EXPENSE' && t.category === budget.category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      const percentage = (spent / budget.amount) * 100
      const status =
        percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'

      return {
        ...budget,
        spent,
        percentage,
        status,
      }
    })
  }, [budgets, transactions])

  const { avgDailySpend, savingsRate, totalExpenses, totalIncome } =
    useMemo(() => {
      const expenses = transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)
      const income = transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        avgDailySpend: expenses / 30,
        savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
        totalExpenses: expenses,
        totalIncome: income,
      }
    }, [transactions])

  const hasReportData =
    transactions.length > 0 || budgets.length > 0 || goals.length > 0
  const scheduleDayOptions =
    reportSchedule.frequency === 'Weekly' ? weeklyOptions : monthlyOptions

  const formatScheduleTime = (timeValue: string) => {
    const [hourValue, minuteValue] = timeValue.split(':')
    const hours = Number(hourValue)
    const minutes = Number(minuteValue)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return timeValue
    }
    const displayDate = new Date()
    displayDate.setHours(hours, minutes, 0, 0)
    return displayDate.toLocaleTimeString(displayLocale, {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const nextScheduledRunLabel = useMemo(() => {
    if (!reportSchedule.enabled) {
      return 'Not scheduled'
    }
    const [hourValue, minuteValue] = reportSchedule.time.split(':')
    const hours = Number(hourValue)
    const minutes = Number(minuteValue)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return 'Invalid time'
    }
    const now = new Date()
    const nextRun = new Date(now)
    nextRun.setSeconds(0, 0)
    nextRun.setHours(hours, minutes)

    if (reportSchedule.frequency === 'Weekly') {
      const parsedTargetDay = Number(reportSchedule.day)
      const targetDay = Number.isNaN(parsedTargetDay) ? 1 : parsedTargetDay
      const normalizedCurrent = now.getDay() === 0 ? 7 : now.getDay()
      let daysUntil = targetDay - normalizedCurrent
      if (daysUntil < 0 || (daysUntil === 0 && nextRun <= now)) {
        daysUntil += 7
      }
      nextRun.setDate(now.getDate() + daysUntil)
    } else {
      const parsedTargetDay = Number(reportSchedule.day)
      const targetDay = Number.isNaN(parsedTargetDay) ? 1 : parsedTargetDay
      nextRun.setDate(targetDay)
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
        nextRun.setDate(targetDay)
      }
    }

    return nextRun.toLocaleString(displayLocale, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }, [displayLocale, reportSchedule])

  const escapeCsv = (value: string | number | undefined) => {
    if (value === undefined || value === null) {
      return ''
    }
    const baseText = String(value)
    const text =
      /^[=+\-@]/.test(baseText) || baseText.startsWith('\t')
        ? `'${baseText}`
        : baseText
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`
    }
    return text
  }

  const escapeHtml = (value: string | number) => {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const buildReportPayload = () => {
    const reportDate = new Date()
    const summary = [
      {
        label: 'Report date',
        value: reportDate.toLocaleDateString(displayLocale),
      },
      { label: 'Avg daily spend', value: formatCurrency(avgDailySpend) },
      {
        label: 'Savings rate',
        value: totalIncome > 0 ? `${savingsRate.toFixed(1)}%` : '0%',
      },
      { label: 'Total income', value: formatCurrency(totalIncome) },
      { label: 'Total expenses', value: formatCurrency(totalExpenses) },
    ]

    const transactionRows = transactions.map((transaction) => {
      const signedAmount =
        transaction.type === 'EXPENSE'
          ? -Math.abs(transaction.amount)
          : transaction.amount

      return {
        date: new Date(transaction.date).toLocaleDateString(displayLocale),
        description: transaction.description,
        category: transaction.category || 'Other',
        type: transaction.type === 'EXPENSE' ? 'Expense' : 'Income',
        amount: signedAmount,
      }
    })

    const budgetRows = budgetPerformance.map((budget) => ({
      name: budget.name,
      category: budget.category || 'General',
      budgeted: budget.amount,
      spent: budget.spent,
      remaining: Math.max(budget.amount - budget.spent, 0),
      utilization: budget.percentage,
    }))

    const goalRows = goals.map((goal) => {
      const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0)
      const progress =
        goal.targetAmount > 0
          ? (goal.currentAmount / goal.targetAmount) * 100
          : 0

      return {
        name: goal.name,
        target: goal.targetAmount,
        current: goal.currentAmount,
        remaining,
        targetDate: goal.targetDate
          ? new Date(goal.targetDate).toLocaleDateString(displayLocale)
          : '—',
        progress,
      }
    })

    return {
      reportDate,
      summary,
      transactionRows,
      budgetRows,
      goalRows,
    }
  }

  const handleExportCsv = () => {
    if (!hasReportData) {
      toast({
        title: 'No data to export',
        description:
          'Add transactions, budgets, or goals to generate a report.',
      })
      return
    }

    const reportPayload = buildReportPayload()
    const reportDateStamp = reportPayload.reportDate.toISOString().slice(0, 10)
    const exportCurrency = getDisplayPreferences().currency
    const lines: string[] = []
    const csvHeaders = [
      'section',
      'item',
      'date',
      'name',
      'category',
      'status',
      'amount',
      'target',
      'progress_pct',
      'currency',
      'notes',
    ] as const

    type TCsvHeader = (typeof csvHeaders)[number]
    type TCsvRow = Record<TCsvHeader, string | number | undefined>

    const csvRows: TCsvRow[] = [
      {
        section: 'summary',
        item: 'report_date',
        date: reportDateStamp,
        name: 'Report Date',
        category: '',
        status: 'generated',
        amount: '',
        target: '',
        progress_pct: '',
        currency: '',
        notes: 'FinanceFlow analytics export',
      },
      {
        section: 'summary',
        item: 'avg_daily_spend',
        date: '',
        name: 'Average Daily Spend',
        category: '',
        status: 'calculated',
        amount: avgDailySpend.toFixed(2),
        target: '',
        progress_pct: '',
        currency: exportCurrency,
        notes: 'Calculated from the last 30 days of expense activity.',
      },
      {
        section: 'summary',
        item: 'savings_rate',
        date: '',
        name: 'Savings Rate',
        category: '',
        status: 'calculated',
        amount: '',
        target: '',
        progress_pct: savingsRate.toFixed(1),
        currency: '',
        notes: 'Percent of income retained after expenses.',
      },
      {
        section: 'summary',
        item: 'total_income',
        date: '',
        name: 'Total Income',
        category: '',
        status: 'calculated',
        amount: totalIncome.toFixed(2),
        target: '',
        progress_pct: '',
        currency: exportCurrency,
        notes: 'Current reporting window total.',
      },
      {
        section: 'summary',
        item: 'total_expenses',
        date: '',
        name: 'Total Expenses',
        category: '',
        status: 'calculated',
        amount: totalExpenses.toFixed(2),
        target: '',
        progress_pct: '',
        currency: exportCurrency,
        notes: 'Current reporting window total.',
      },
      ...reportPayload.transactionRows.map((transaction) => ({
        section: 'transaction',
        item: transaction.type.toLowerCase(),
        date: transaction.date,
        name: transaction.description,
        category: transaction.category,
        status: transaction.type,
        amount: transaction.amount.toFixed(2),
        target: '',
        progress_pct: '',
        currency: exportCurrency,
        notes: '',
      })),
      ...reportPayload.budgetRows.map((budget) => ({
        section: 'budget',
        item: 'budget_status',
        date: '',
        name: budget.name,
        category: budget.category,
        status:
          budget.utilization > 100
            ? 'Over Budget'
            : budget.utilization > 80
              ? 'Warning'
              : 'On Track',
        amount: budget.spent.toFixed(2),
        target: budget.budgeted.toFixed(2),
        progress_pct: budget.utilization.toFixed(1),
        currency: exportCurrency,
        notes: `Remaining ${budget.remaining.toFixed(2)}`,
      })),
      ...reportPayload.goalRows.map((goal) => ({
        section: 'goal',
        item: 'goal_progress',
        date: goal.targetDate === '—' ? '' : goal.targetDate,
        name: goal.name,
        category: '',
        status: goal.progress >= 100 ? 'Completed' : 'In Progress',
        amount: goal.current.toFixed(2),
        target: goal.target.toFixed(2),
        progress_pct: goal.progress.toFixed(1),
        currency: exportCurrency,
        notes: `Remaining ${goal.remaining.toFixed(2)}`,
      })),
    ]

    lines.push(csvHeaders.map((header) => escapeCsv(header)).join(','))
    csvRows.forEach((row) => {
      lines.push(
        csvHeaders.map((header) => escapeCsv(row[header] ?? '')).join(',')
      )
    })

    const blob = new Blob([lines.join('\n')], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.body.appendChild(document.createElement('a'))
    link.href = url
    link.download = `financeflow-report-${reportDateStamp}.csv`
    link.click()
    link.remove()
    URL.revokeObjectURL(url)

    toast({
      title: 'CSV exported',
      description:
        'Your CSV now uses concise columns for better spreadsheet readability.',
    })
  }

  const handleExportPdf = () => {
    if (!hasReportData) {
      toast({
        title: 'No data to export',
        description:
          'Add transactions, budgets, or goals to generate a report.',
      })
      return
    }

    const reportPayload = buildReportPayload()
    const reportDateStamp =
      reportPayload.reportDate.toLocaleDateString(displayLocale)

    const pdfHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Financial report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            * { box-sizing: border-box; }
            body {
              margin: 40px;
              font-family: 'Inter', -apple-system, sans-serif;
              color: #1e293b;
              background: #ffffff;
              line-height: 1.5;
            }
            header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #f1f5f9;
            }
            .brand {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .brand-dot {
              height: 12px;
              width: 12px;
              border-radius: 50%;
              background: #10b981;
            }
            .brand-name {
              font-size: 18px;
              font-weight: 700;
              letter-spacing: -0.02em;
            }
            h1 { font-size: 28px; margin: 0; font-weight: 700; letter-spacing: -0.03em; }
            h2 { font-size: 14px; margin: 32px 0 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 600; }
            .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
            
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 16px;
              margin-top: 16px;
            }
            .metric-card {
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
              background: #f8fafc;
            }
            .metric-label {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #64748b;
              margin-bottom: 4px;
              font-weight: 500;
            }
            .metric-value {
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
            }
            
            table {
              width: 100%;
              border-collapse: separate;
              border-spacing: 0;
              margin-top: 8px;
            }
            th, td {
              padding: 12px;
              border-bottom: 1px solid #f1f5f9;
              text-align: left;
              font-size: 12px;
            }
            th {
              background: #f8fafc;
              font-weight: 600;
              color: #475569;
              border-top: 1px solid #f1f5f9;
            }
            tr:last-child td { border-bottom: none; }
            
            .amount { font-weight: 600; text-align: right; }
            .negative { color: #e11d48; }
            .positive { color: #059669; }
            
            .status-badge {
              padding: 2px 8px;
              border-radius: 99px;
              font-size: 10px;
              font-weight: 600;
              background: #f1f5f9;
              color: #475569;
            }

            @media print {
              body { margin: 20mm; }
              .section { break-inside: avoid; }
              header { border-bottom-color: #cbd5e1; }
            }
          </style>
        </head>
        <body>
          <header>
            <div>
              <h1>Financial Report</h1>
              <p class="subtitle">Generated on ${escapeHtml(reportDateStamp)}</p>
            </div>
            <div class="brand">
              <div class="brand-dot"></div>
              <span class="brand-name">FinanceFlow</span>
            </div>
          </header>

          <section>
            <h2>Snapshot</h2>
            <div class="metrics-grid">
              ${reportPayload.summary
                .map(
                  (item) => `
                    <div class="metric-card">
                      <div class="metric-label">${escapeHtml(item.label)}</div>
                      <div class="metric-value">${escapeHtml(item.value)}</div>
                    </div>
                  `
                )
                .join('')}
            </div>
          </section>

          <section>
            <h2>Transaction Activity</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${reportPayload.transactionRows
                  .map(
                    (t) => `
                  <tr>
                    <td>${escapeHtml(t.date)}</td>
                    <td>${escapeHtml(t.description)}</td>
                    <td><span class="status-badge">${escapeHtml(t.category)}</span></td>
                    <td class="amount ${t.amount < 0 ? 'negative' : 'positive'}">
                      ${formatCurrency(t.amount)}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </section>

          ${
            reportPayload.budgetRows.length > 0
              ? `
          <section>
            <h2>Budget Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Budgeted</th>
                  <th>Spent</th>
                  <th style="text-align: right;">Utilization</th>
                </tr>
              </thead>
              <tbody>
                ${reportPayload.budgetRows
                  .map(
                    (b) => `
                  <tr>
                    <td>${escapeHtml(b.name)}</td>
                    <td>${escapeHtml(b.category)}</td>
                    <td>${formatCurrency(b.budgeted)}</td>
                    <td>${formatCurrency(b.spent)}</td>
                    <td style="text-align: right; font-weight: 600;">${b.utilization.toFixed(1)}%</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </section>
          `
              : ''
          }

          ${
            reportPayload.goalRows.length > 0
              ? `
          <section>
            <h2>Financial Goals</h2>
            <table>
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Target Date</th>
                  <th>Target</th>
                  <th style="text-align: right;">Progress</th>
                </tr>
              </thead>
              <tbody>
                ${reportPayload.goalRows
                  .map(
                    (g) => `
                  <tr>
                    <td>${escapeHtml(g.name)}</td>
                    <td>${escapeHtml(g.targetDate)}</td>
                    <td>${formatCurrency(g.target)}</td>
                    <td style="text-align: right; font-weight: 600;">${g.progress.toFixed(1)}%</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </section>
          `
              : ''
          }
        </body>
      </html>
    `

    const reportWindow = window.open('', '_blank', 'noopener,noreferrer')
    if (!reportWindow) {
      toast({
        title: 'Popup blocked',
        description: 'Enable popups to export the PDF report.',
      })
      return
    }
    reportWindow.document.write(pdfHtml)
    reportWindow.document.close()
    reportWindow.focus()
    window.setTimeout(() => {
      reportWindow.print()
    }, 400)

    toast({
      title: 'PDF ready',
      description: 'Your PDF report is open and ready to print or save.',
    })
  }

  const handleScheduleFrequencyChange = (value: ReportFrequency) => {
    setReportSchedule((prev) => ({
      ...prev,
      frequency: value,
      day:
        value === 'Weekly' && Number(prev.day) > 5
          ? '1'
          : value === 'Monthly' && Number(prev.day) < 1
            ? '1'
            : prev.day,
    }))
  }

  const handleScheduleToggle = () => {
    setReportSchedule((prev) => ({ ...prev, enabled: !prev.enabled }))
  }

  const handleScheduleSave = () => {
    if (!reportSchedule.enabled) {
      toast({
        title: 'Schedule disabled',
        description: 'Enable scheduled reports before saving.',
      })
      return
    }

    const scheduleDayLabel =
      reportSchedule.frequency === 'Weekly'
        ? (weeklyOptions.find((option) => option.value === reportSchedule.day)
            ?.label ?? 'Monday')
        : `Day ${reportSchedule.day}`
    const scheduleTimeLabel = formatScheduleTime(reportSchedule.time)

    addNotification({
      type: 'info',
      title: 'Report schedule updated',
      message:
        `${reportSchedule.frequency} report on ${scheduleDayLabel} at ` +
        `${scheduleTimeLabel}.`,
      category: 'system',
      showToast: false,
    })

    toast({
      title: 'Schedule saved',
      description: `Next report: ${nextScheduledRunLabel}.`,
    })
  }

  const handleSetAlerts = () => {
    addNotification({
      type: 'info',
      title: 'Spending alert enabled',
      message:
        'We will notify you if monthly expenses rise 10% above your recent ' +
        'average.',
      category: 'budget',
      showToast: false,
      action: {
        label: 'View alerts',
        onClick: () => setShowNotificationCenter(true),
      },
    })
    setShowNotificationCenter(true)
  }

  return (
    <Card
      className={`bg-card/90 border border-border/70 shadow-sm ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-foreground">
              Financial Analytics
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Snapshot of trends, spending, and budget health.
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-sky-600 dark:text-sky-300 bg-sky-500/10 border-sky-500/30"
          >
            Advanced
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={compact ? 'space-y-6' : 'space-y-8'}>
        {/* Key Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Avg Daily Spend
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {formatCurrency(avgDailySpend)}
            </div>
            <div className="text-xs text-muted-foreground">Last 30 days</div>
          </div>
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Savings Rate
              </span>
            </div>
            <div className="text-lg font-bold text-foreground">
              {totalIncome > 0 ? `${savingsRate.toFixed(1)}%` : '0%'}
            </div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>
        </div>

        {!compact ? (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground/90">
              Spending by Category
            </h4>
            {pieData.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr]">
                <div className={compact ? 'h-44' : 'h-56'}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={46}
                        outerRadius={80}
                        paddingAngle={2}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))',
                          borderRadius: 12,
                          boxShadow: '0 18px 32px -20px rgba(0, 0, 0, 0.45)',
                          padding: '10px 12px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {pieData.map((item, index) => {
                    const percent =
                      pieTotal > 0 ? (item.value / pieTotal) * 100 : 0
                    return (
                      <div
                        key={`${item.name}-${index}`}
                        className={
                          'flex items-center justify-between rounded-xl border ' +
                          'border-border/40 bg-card/70 px-3.5 py-2.5 shadow-sm ' +
                          'transition-colors hover:bg-muted/30'
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor:
                                CHART_COLORS[index % CHART_COLORS.length],
                            }}
                          />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {percent.toFixed(1)}% of total
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div
                className={
                  'rounded-xl border border-dashed border-border/60 bg-muted/10 ' +
                  'px-4 py-6 text-center'
                }
              >
                <p className="text-sm font-medium text-foreground">
                  No spending data
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add expenses to see category breakdowns.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Monthly Trend */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground/90">
            Monthly Spending Trend
          </h4>
          <div className={compact ? 'h-40' : 'h-52'}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted-foreground))"
                  strokeOpacity={0.25}
                />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: 12,
                    boxShadow: '0 18px 32px -20px rgba(0, 0, 0, 0.45)',
                    padding: '10px 12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                />
                <Bar
                  dataKey="expenses"
                  fill="#ef4444"
                  name="Expenses"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="income"
                  fill="#22c55e"
                  name="Income"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Performance */}
        {budgetPerformance.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground/90">
              Budget Performance
            </h4>
            <div className="space-y-2">
              {budgetPerformance.slice(0, compact ? 2 : 3).map((budget) => (
                <div
                  key={budget.id}
                  className="p-4 rounded-xl border border-border/50 bg-card/60"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      {budget.category}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        budget.status === 'over'
                          ? 'text-rose-600 dark:text-rose-300 bg-rose-500/10 border-rose-500/30'
                          : budget.status === 'warning'
                            ? 'text-amber-600 dark:text-amber-300 ' +
                              'bg-amber-500/10 border-amber-500/30'
                            : 'text-emerald-600 dark:text-emerald-300 ' +
                              'bg-emerald-500/10 border-emerald-500/30'
                      }
                    >
                      {budget.status === 'over'
                        ? 'Over Budget'
                        : budget.status === 'warning'
                          ? 'Warning'
                          : 'On Track'}
                    </Badge>
                  </div>
                  <div
                    className={
                      'flex items-center justify-between text-xs ' +
                      'text-muted-foreground mb-2'
                    }
                  >
                    <span>
                      {formatCurrency(budget.spent)} /{' '}
                      {formatCurrency(budget.amount)}
                    </span>
                    <span>{budget.percentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={Math.min(budget.percentage, 100)}
                    className="h-2.5"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reporting & Export */}
        {compact ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground/90">
                  Reporting & Export
                </h4>
                <p className="text-xs text-muted-foreground">
                  Quick export tools for your overview report.
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
              >
                Reports
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
              <div className="rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Next scheduled report
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {nextScheduledRunLabel}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {reportSchedule.enabled
                    ? `${reportSchedule.frequency} at ${formatScheduleTime(reportSchedule.time)}`
                    : 'Scheduling is currently paused'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-semibold"
                  onClick={handleExportCsv}
                  disabled={!hasReportData}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-semibold"
                  onClick={handleExportPdf}
                  disabled={!hasReportData}
                >
                  Export PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs font-semibold"
                  onClick={handleSetAlerts}
                >
                  Alerts
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground/90">
                  Reporting & Export
                </h4>
                <p className="text-xs text-muted-foreground">
                  Clean CSV and PDF exports with scheduling built in.
                </p>
              </div>
              <Badge
                variant="outline"
                className="text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 border-emerald-500/30"
              >
                Reports
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Exports
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Summary, transactions, budgets, and goals in one report.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold rounded-full"
                      onClick={handleExportCsv}
                      disabled={!hasReportData}
                    >
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold rounded-full"
                      onClick={handleExportPdf}
                      disabled={!hasReportData}
                    >
                      Export PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-semibold rounded-full"
                      onClick={handleSetAlerts}
                    >
                      Set Alerts
                    </Button>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border/50 bg-card/70 p-4 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      Schedule reports
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Automate weekly or monthly exports.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        reportSchedule.enabled
                          ? 'text-emerald-600 dark:text-emerald-300 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-muted-foreground border-border/60'
                      }
                    >
                      {reportSchedule.enabled ? 'Active' : 'Paused'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-full px-3 text-xs"
                      onClick={handleScheduleToggle}
                      aria-pressed={reportSchedule.enabled}
                    >
                      {reportSchedule.enabled ? 'Pause' : 'Enable'}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Frequency
                    </Label>
                    <Select
                      value={reportSchedule.frequency}
                      onValueChange={(value) =>
                        handleScheduleFrequencyChange(value as ReportFrequency)
                      }
                      disabled={!reportSchedule.enabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Weekly">Weekly</SelectItem>
                        <SelectItem value="Monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {reportSchedule.frequency === 'Weekly'
                        ? 'Day of week'
                        : 'Day of month'}
                    </Label>
                    <Select
                      value={reportSchedule.day}
                      onValueChange={(value) =>
                        setReportSchedule((prev) => ({ ...prev, day: value }))
                      }
                      disabled={!reportSchedule.enabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduleDayOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label
                      htmlFor="report-time"
                      className="text-xs text-muted-foreground"
                    >
                      Time
                    </Label>
                    <Input
                      id="report-time"
                      type="time"
                      value={reportSchedule.time}
                      onChange={(event) =>
                        setReportSchedule((prev) => ({
                          ...prev,
                          time: event.target.value,
                        }))
                      }
                      disabled={!reportSchedule.enabled}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Delivery
                    </Label>
                    <div className="flex h-10 items-center rounded-md border border-border/60 bg-muted/30 px-3 text-sm text-muted-foreground">
                      Download
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Next scheduled report
                    </p>
                    <p className="text-sm font-semibold text-foreground">
                      {nextScheduledRunLabel}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={handleScheduleSave}
                    disabled={!reportSchedule.enabled}
                  >
                    Save schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

export { AnalyticsDashboard }
