'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useBillingStatus } from '@/hooks/use-billing-status'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { useCreditCards, useTransactions } from '@/hooks/use-finance-data'
import { formatCurrency } from '@/lib/utils'

const clampPercentage = (value: number) => Math.min(100, Math.max(0, value))

interface ICreditCardModel {
  id: string
  name: string
  balance: number
  limit: number
}

interface ITransactionModel {
  amount: number
  date: string | Date
  description: string
  type: string
}

const getUtilizationFactorScore = (utilizationPercent: number) => {
  if (utilizationPercent <= 10) return 96
  if (utilizationPercent <= 20) return 88
  if (utilizationPercent <= 30) return 78
  if (utilizationPercent <= 50) return 58
  if (utilizationPercent <= 75) return 34
  return 16
}

const getDebtToIncomeFactorScore = (debtToIncomeRatio: number) => {
  if (debtToIncomeRatio <= 0.15) return 92
  if (debtToIncomeRatio <= 0.3) return 76
  if (debtToIncomeRatio <= 0.4) return 58
  if (debtToIncomeRatio <= 0.5) return 34
  return 18
}

const getCashflowFactorScore = (netCashflowPercent: number) => {
  if (netCashflowPercent >= 25) return 92
  if (netCashflowPercent >= 10) return 78
  if (netCashflowPercent >= 0) return 64
  if (netCashflowPercent >= -10) return 42
  return 18
}

const getPaymentSignalFactorScore = (paymentSignalCount: number) => {
  return clampPercentage(paymentSignalCount * 12)
}

const getCreditMixFactorScore = (cardCount: number) => {
  if (cardCount >= 4) return 86
  if (cardCount === 3) return 76
  if (cardCount === 2) return 66
  if (cardCount === 1) return 52
  return 20
}

export default function CreditScorePage() {
  const { isDemoMode } = useDemoMode()
  const { data: billingData, isLoading: isBillingLoading } = useBillingStatus()
  const { data: creditCards = [] } = useCreditCards()
  const { data: transactions = [] } = useTransactions()

  const hasProAccess =
    isDemoMode ||
    billingData?.isSuperUser === true ||
    billingData?.currentPlan === 'PRO'
  const normalizedCreditCards = creditCards as ICreditCardModel[]
  const normalizedTransactions = transactions as ITransactionModel[]

  const report = useMemo(() => {
    const totalCreditBalance = normalizedCreditCards.reduce(
      (sum: number, card: ICreditCardModel) => sum + Math.max(card.balance, 0),
      0
    )
    const totalCreditLimit = normalizedCreditCards.reduce(
      (sum: number, card: ICreditCardModel) => sum + Math.max(card.limit, 0),
      0
    )
    const utilizationPercent =
      totalCreditLimit > 0 ? (totalCreditBalance / totalCreditLimit) * 100 : 0

    const now = Date.now()
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000

    let monthlyIncome = 0
    let monthlyExpenses = 0
    let paymentSignalCount = 0

    normalizedTransactions.forEach((transaction: ITransactionModel) => {
      const timestamp = new Date(transaction.date).getTime()
      const amount = Number(transaction.amount)
      const description = String(transaction.description).toLowerCase()

      if (timestamp >= thirtyDaysAgo) {
        if (transaction.type === 'INCOME') {
          monthlyIncome += amount
        }
        if (transaction.type === 'EXPENSE') {
          monthlyExpenses += Math.abs(amount)
        }
      }

      if (
        timestamp >= ninetyDaysAgo &&
        transaction.type === 'EXPENSE' &&
        /(card payment|credit payment|payment received|payment)/.test(
          description
        )
      ) {
        paymentSignalCount += 1
      }
    })

    const estimatedMinimumPayments = totalCreditBalance * 0.03
    const debtToIncomeRatio =
      monthlyIncome > 0 ? estimatedMinimumPayments / monthlyIncome : 1
    const netCashflowPercent =
      monthlyIncome > 0
        ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
        : -100

    const factors = [
      {
        label: 'Utilization impact',
        score: getUtilizationFactorScore(utilizationPercent),
        detail:
          totalCreditLimit > 0
            ? `${utilizationPercent.toFixed(1)}% usage of total limits`
            : 'Add credit limits to generate utilization analysis',
      },
      {
        label: 'Debt-to-income pressure',
        score: getDebtToIncomeFactorScore(debtToIncomeRatio),
        detail: `Estimated minimum payments ${formatCurrency(
          estimatedMinimumPayments
        )} / month`,
      },
      {
        label: 'Cashflow reliability',
        score: getCashflowFactorScore(netCashflowPercent),
        detail: `${netCashflowPercent.toFixed(1)}% monthly net cashflow margin`,
      },
      {
        label: 'Payment activity signal',
        score: getPaymentSignalFactorScore(paymentSignalCount),
        detail: `${paymentSignalCount} potential payment events in the last 90 days`,
      },
      {
        label: 'Credit mix depth',
        score: getCreditMixFactorScore(normalizedCreditCards.length),
        detail: `${normalizedCreditCards.length} credit card account${
          normalizedCreditCards.length === 1 ? '' : 's'
        } connected`,
      },
    ]

    const weightedFactorScore =
      factors[0].score * 0.34 +
      factors[1].score * 0.24 +
      factors[2].score * 0.2 +
      factors[3].score * 0.14 +
      factors[4].score * 0.08

    const estimatedScore = Math.round(300 + weightedFactorScore * 5.5)
    const projectedScoreIfUtilizationUnder30 = Math.min(
      850,
      estimatedScore + (utilizationPercent > 30 ? 42 : 12)
    )
    const projectedScoreIfUtilizationUnder10 = Math.min(
      850,
      estimatedScore + (utilizationPercent > 10 ? 78 : 18)
    )

    const recommendedPaydownTarget = Math.max(
      totalCreditBalance - totalCreditLimit * 0.3,
      0
    )

    const actions: string[] = []
    if (utilizationPercent > 30) {
      actions.push(
        `Pay down ${formatCurrency(
          recommendedPaydownTarget
        )} to reach sub-30% utilization.`
      )
    }
    if (utilizationPercent > 10) {
      actions.push(
        'Move one large payment before statement close to lower reported usage.'
      )
    }
    if (debtToIncomeRatio > 0.35) {
      actions.push(
        'Reduce non-essential spending this month to protect payment coverage.'
      )
    }
    if (paymentSignalCount < 4) {
      actions.push(
        'Set automated card payments to strengthen consistency signals.'
      )
    }
    if (normalizedCreditCards.length < 2) {
      actions.push(
        'Add another low-fee card over time to improve your credit mix profile.'
      )
    }
    if (actions.length === 0) {
      actions.push(
        'Maintain your current trajectory and avoid unnecessary credit pulls.'
      )
    }

    return {
      actions,
      estimatedMinimumPayments,
      estimatedScore,
      factors,
      monthlyIncome,
      projectedScoreIfUtilizationUnder10,
      projectedScoreIfUtilizationUnder30,
      recommendedPaydownTarget,
      totalCreditBalance,
      totalCreditLimit,
      utilizationPercent,
    }
  }, [normalizedCreditCards, normalizedTransactions])

  if (isBillingLoading && !isDemoMode) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Credit Score Lab</h1>
        <p className="text-sm text-muted-foreground">Loading your report...</p>
      </div>
    )
  }

  if (!hasProAccess) {
    return (
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-xl">Credit Score Lab</CardTitle>
          <CardDescription>
            Unlock Pro to access score modeling, utilization simulations, and
            account-level improvement plans.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Starter covers live tracking. Pro adds deeper credit analytics and
            strategy guidance.
          </p>
          <Button asChild>
            <Link href="/billing">Upgrade to Pro</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const scoreBand =
    report.estimatedScore >= 760
      ? 'Excellent'
      : report.estimatedScore >= 700
        ? 'Good'
        : report.estimatedScore >= 640
          ? 'Fair'
          : 'Needs attention'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Credit Score Lab</h1>
          <p className="text-sm text-muted-foreground">
            Pro-only credit health simulation and action plan.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/billing">Manage plan</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Card className="border-border/70 bg-card/90 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Estimated score</CardTitle>
            <CardDescription>
              Educational estimate. Not an official bureau score.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-end justify-between">
              <p className="text-4xl font-semibold tracking-tight">
                {report.estimatedScore}
              </p>
              <span className="rounded-full border border-border/60 bg-muted/30 px-2.5 py-1 text-xs font-semibold">
                {scoreBand}
              </span>
            </div>
            <Progress
              value={(report.estimatedScore - 300) / 5.5}
              className="h-2.5"
            />
            <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
              <div>
                <p className="font-medium text-foreground">Current</p>
                <p>{report.estimatedScore}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">If below 30%</p>
                <p>{report.projectedScoreIfUtilizationUnder30}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">If below 10%</p>
                <p>{report.projectedScoreIfUtilizationUnder10}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Target paydown</p>
                <p>{formatCurrency(report.recommendedPaydownTarget)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-3xl font-semibold">
              {report.utilizationPercent.toFixed(1)}%
            </p>
            <p className="text-muted-foreground">
              {formatCurrency(report.totalCreditBalance)} used of{' '}
              {formatCurrency(report.totalCreditLimit)}.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Payment load</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-3xl font-semibold">
              {formatCurrency(report.estimatedMinimumPayments)}
            </p>
            <p className="text-muted-foreground">
              Estimated monthly card payments against{' '}
              {formatCurrency(report.monthlyIncome)} monthly income.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="border-border/70 bg-card/90 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Score factors</CardTitle>
            <CardDescription>
              Weighted internal model calibrated for practical decision support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.factors.map((factor) => (
              <div key={factor.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">
                    {factor.label}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {factor.score}/100
                  </p>
                </div>
                <Progress value={factor.score} className="h-2.5" />
                <p className="text-xs text-muted-foreground">{factor.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/90 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Improvement actions</CardTitle>
            <CardDescription>
              Highest impact changes to raise your score trajectory.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.actions.map((action) => (
              <div
                key={action}
                className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                <p className="text-sm text-foreground">{action}</p>
              </div>
            ))}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 h-4 w-4" />
                <p>
                  This report is informational and should not be treated as an
                  official lending score from Equifax, Experian, or TransUnion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/70 bg-card/90">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            Account-level utilization report
          </CardTitle>
          <CardDescription>
            Identify which cards to pay down first for the fastest score impact.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {normalizedCreditCards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 px-4 py-5 text-sm text-muted-foreground">
              Add credit cards in Overview to unlock account-level reporting.
            </div>
          ) : (
            normalizedCreditCards.map((card) => {
              const balance = Math.max(card.balance, 0)
              const limit = Math.max(card.limit, 0)
              const utilizationPercent = limit > 0 ? (balance / limit) * 100 : 0
              const paydownToThirtyPercent = Math.max(balance - limit * 0.3, 0)

              return (
                <div
                  key={card.id}
                  className="grid gap-3 rounded-xl border border-border/60 bg-card/70 p-3 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {card.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current utilization {utilizationPercent.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Balance</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(balance)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">Limit</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(limit)}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-xs text-muted-foreground">To 30%</p>
                    <p className="font-medium text-foreground">
                      {formatCurrency(paydownToThirtyPercent)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="self-start">
                    <span>Prioritize</span>
                    <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
