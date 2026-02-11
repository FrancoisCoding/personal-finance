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

export interface IDonationsCardProps {
  /** Donation recipients breakdown */
  entries: IDonationEntry[]
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
  total,
  hasData,
  className,
}: IDonationsCardProps) => {
  const recipientCount = entries.length

  return (
    <Card
      className={cn('bg-card/80 border border-border/60 shadow-sm', className)}
    >
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Giving & Donations
            </CardTitle>
            <CardDescription>
              Track churches, charities, and community support.
            </CardDescription>
          </div>
          <span className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-muted-foreground">
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
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasData ? (
          entries.map((entry) => (
            <div
              key={entry.name}
              className={
                'flex items-center justify-between rounded-lg border ' +
                'border-border/60 bg-muted/30 px-3 py-2'
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
          ))
        ) : (
          <div
            className={
              'rounded-lg border border-dashed border-border/70 bg-muted/20 ' +
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
