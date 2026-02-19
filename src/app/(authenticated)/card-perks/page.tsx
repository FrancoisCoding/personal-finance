'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Clock3, Gift, Sparkles, Ticket } from 'lucide-react'
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
import { useAccounts, useTransactions } from '@/hooks/use-finance-data'
import { analyzeCreditCardPerks } from '@/lib/credit-card-perks'
import { formatCurrency } from '@/lib/utils'

const getPerkStatusBadgeClassName = (status: 'unused' | 'partial' | 'used') => {
  if (status === 'used') {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
  }
  if (status === 'partial') {
    return 'border-amber-500/30 bg-amber-500/10 text-amber-500'
  }
  return 'border-rose-500/30 bg-rose-500/10 text-rose-500'
}

const getPerkStatusLabel = (status: 'unused' | 'partial' | 'used') => {
  if (status === 'used') return 'Used'
  if (status === 'partial') return 'Partial'
  return 'Unused'
}

export default function CardPerksPage() {
  const { isDemoMode } = useDemoMode()
  const { data: billingData, isLoading: isBillingLoading } = useBillingStatus()
  const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts()
  const { data: transactions = [], isLoading: isTransactionsLoading } =
    useTransactions()

  const hasProAccess =
    isDemoMode ||
    billingData?.isSuperUser === true ||
    billingData?.currentPlan === 'PRO'

  const insight = useMemo(
    () =>
      analyzeCreditCardPerks({
        accounts,
        transactions,
      }),
    [accounts, transactions]
  )

  if (
    (isBillingLoading && !isDemoMode) ||
    isAccountsLoading ||
    isTransactionsLoading
  ) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Credit Card Perk Insights</h1>
        <p className="text-sm text-muted-foreground">
          Loading card perk insights...
        </p>
      </div>
    )
  }

  if (!hasProAccess) {
    return (
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-xl">Credit Card Perk Insights</CardTitle>
          <CardDescription>
            Card perk insights are available on the Pro plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Upgrade to Pro to unlock monthly perk tracking, expiration
            reminders, and merchant-level usage detection.
          </p>
          <Button asChild>
            <Link href="/billing">Upgrade to Pro</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div
        className="flex flex-wrap items-start justify-between gap-3"
        data-demo-step="demo-card-perks-header"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Credit Card Perk Insights</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Track monthly credits and benefits for premium cards, with usage
            detection from your transactions.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/billing">Manage plan</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Eligible cards
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {insight.trackedCardCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Perks tracked
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {insight.trackedPerkCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Used this month
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
              {formatCurrency(insight.redeemedMonthlyValue)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/70 bg-card/90">
          <CardContent className="pt-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Unused value
            </p>
            <p className="mt-1 text-2xl font-semibold text-amber-600 dark:text-amber-300">
              {formatCurrency(insight.remainingMonthlyValue)}
            </p>
            {insight.expiringSoonCount > 0 ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {insight.expiringSoonCount} perk
                {insight.expiringSoonCount === 1 ? '' : 's'} expiring soon
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {insight.cards.length === 0 ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle>No supported perk cards detected</CardTitle>
            <CardDescription>
              Add or rename a credit card account to match supported perk
              programs such as American Express Gold.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card
          className="border-border/70 bg-card/90"
          data-demo-step="demo-card-perks-list"
        >
          <CardHeader>
            <CardTitle>Perk usage by card</CardTitle>
            <CardDescription>
              Monthly credits and how much value you have already captured.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {insight.cards.map((card) => (
              <div
                key={card.cardId}
                className="rounded-2xl border border-border/60 bg-muted/10 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-foreground">
                      {card.cardName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Program: {card.programName}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>
                      {formatCurrency(card.redeemedMonthlyValue)} of{' '}
                      {formatCurrency(card.totalMonthlyValue)} captured
                    </p>
                    <p>
                      {formatCurrency(card.remainingMonthlyValue)} remaining
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {card.perks.map((perk) => {
                    const percentage = Math.min(
                      100,
                      (perk.redeemedAmount / perk.monthlyValue) * 100
                    )

                    return (
                      <div
                        key={perk.id}
                        className="rounded-xl border border-border/60 bg-card/70 p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Gift className="h-4 w-4 text-emerald-500" />
                            <p className="text-sm font-semibold text-foreground">
                              {perk.name}
                            </p>
                            <span
                              className={
                                'rounded-full border px-2 py-0.5 text-[11px] font-semibold ' +
                                getPerkStatusBadgeClassName(perk.status)
                              }
                            >
                              {getPerkStatusLabel(perk.status)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(perk.redeemedAmount)} /{' '}
                            {formatCurrency(perk.monthlyValue)}
                          </div>
                        </div>

                        <div className="mt-2">
                          <Progress value={percentage} className="h-2" />
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Ticket className="h-3.5 w-3.5" />
                            Merchants: {perk.merchantLabels.join(', ')}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            Expires in {perk.daysRemainingInCycle} day
                            {perk.daysRemainingInCycle === 1 ? '' : 's'}
                          </span>
                          {perk.isExpiringSoon ? (
                            <span className="inline-flex items-center gap-1 text-amber-500">
                              <Sparkles className="h-3.5 w-3.5" />
                              Expiring soon
                            </span>
                          ) : null}
                        </div>

                        {perk.matchedTransactions.length > 0 ? (
                          <div className="mt-2 space-y-1">
                            {perk.matchedTransactions
                              .slice(0, 3)
                              .map((transaction) => (
                                <div
                                  key={transaction.id}
                                  className="flex items-center justify-between text-xs text-muted-foreground"
                                >
                                  <span className="truncate pr-2">
                                    {transaction.description}
                                  </span>
                                  <span>
                                    {formatCurrency(transaction.amount)} ·{' '}
                                    {transaction.date.toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="mt-2 text-xs text-muted-foreground">
                            No eligible transactions yet this month.
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
