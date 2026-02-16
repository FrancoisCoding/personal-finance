'use client'

// packages
import React from 'react'

// components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

// utils
import { cn, formatCurrency } from '@/lib/utils'

// types
export interface IDonationEntry {
  /** Recipient name */
  name: string
  /** Total amount donated */
  total: number
  /** Number of donations */
  count: number
  /** Most recent donation date string */
  lastDate: string
}

export interface IDonationCauseEntry {
  /** Cause name */
  name: string
  /** Total amount donated */
  total: number
  /** Percent of total giving */
  percent: number
}

export interface IRecurringDonationEntry {
  /** Recipient name */
  name: string
  /** Average donation amount */
  average: number
  /** Recurrence cadence */
  cadence: string
  /** Last donation date */
  lastDate: string
  /** Next expected donation date */
  nextDate?: string
}

export interface IDonationsCardProps {
  /** Donation recipients breakdown */
  entries: IDonationEntry[]
  /** Cause breakdown */
  causes: IDonationCauseEntry[]
  /** Recurring giving breakdown */
  recurring: IRecurringDonationEntry[]
  /** Total donated in the period */
  total: number
  /** Whether there is any donation data */
  hasData: boolean
  /** Optional container class */
  className?: string
}

/** Donations card showing charitable and church giving breakdown. */
const DonationsCard = ({
  entries,
  causes,
  recurring,
  total,
  hasData,
  className,
}: IDonationsCardProps) => {
  const recipientCount = entries.length
  const hasRecurring = recurring.length > 0
  const hasCauses = causes.length > 0

  return (
    <Card
      className={cn('bg-card/90 border border-border/70 shadow-sm', className)}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Giving & Donations
            </CardTitle>
            <CardDescription>
              Track churches, charities, and community support.
            </CardDescription>
          </div>
          <span className="rounded-full border border-border/60 bg-muted/20 px-3 py-1 text-xs text-muted-foreground">
            Last 30 days
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-foreground">
            {formatCurrency(total)}
          </span>
          <span className="text-xs text-muted-foreground">
            {recipientCount} recipient{recipientCount === 1 ? '' : 's'}
          </span>
          {hasRecurring ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-300">
              {recurring.length} recurring
            </span>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {hasData ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Top recipients
              </p>
              {entries.map((entry) => (
                <div
                  key={entry.name}
                  className={
                    'flex items-center justify-between rounded-xl border ' +
                    'border-border/50 bg-card/70 px-3.5 py-2.5 shadow-sm ' +
                    'transition-colors hover:bg-muted/30'
                  }
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {entry.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.count} donation{entry.count === 1 ? '' : 's'} ·{' '}
                      {entry.lastDate}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(entry.total)}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Cause breakdown
              </p>
              {hasCauses ? (
                causes.map((cause) => (
                  <div
                    key={cause.name}
                    className="rounded-xl border border-border/50 bg-muted/10 px-3.5 py-3"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {cause.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(cause.total)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={cause.percent} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {cause.percent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className={
                    'rounded-xl border border-dashed border-border/60 ' +
                    'bg-muted/10 px-4 py-4 text-center'
                  }
                >
                  <p className="text-xs text-muted-foreground">
                    Causes will appear as giving grows.
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Recurring giving
              </p>
              {hasRecurring ? (
                recurring.map((entry) => (
                  <div
                    key={entry.name}
                    className={
                      'flex items-center justify-between rounded-xl border ' +
                      'border-border/50 bg-card/70 px-3.5 py-2.5 shadow-sm'
                    }
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {entry.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {entry.cadence} · Last {entry.lastDate}
                        {entry.nextDate ? ` · Next ${entry.nextDate}` : ''}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(entry.average)}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  className={
                    'rounded-xl border border-dashed border-border/60 ' +
                    'bg-muted/10 px-4 py-4 text-center'
                  }
                >
                  <p className="text-xs text-muted-foreground">
                    No recurring patterns detected yet.
                  </p>
                </div>
              )}
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
              No donations yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Donations will appear here once they are categorized.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DonationsCard
