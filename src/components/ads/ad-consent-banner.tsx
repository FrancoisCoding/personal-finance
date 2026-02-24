'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Megaphone, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useBillingStatus } from '@/hooks/use-billing-status'
import {
  TAdConsentValue,
  readAdConsentValue,
  writeAdConsentValue,
} from '@/lib/ad-consent'

const hiddenPathPrefixes = [
  '/accounts',
  '/assistant',
  '/auth',
  '/budgets',
  '/dashboard',
  '/profile',
  '/security',
  '/security-settings',
  '/subscriptions',
  '/transactions',
]

export function AdConsentBanner() {
  const { data: session } = useSession()
  const { data: billingData, isLoading: isBillingLoading } = useBillingStatus()
  const pathname = usePathname()
  const [consentValue, setConsentValue] = useState<TAdConsentValue | null>(null)

  useEffect(() => {
    setConsentValue(readAdConsentValue())
  }, [])

  const isHiddenPath = useMemo(() => {
    return hiddenPathPrefixes.some(
      (pathPrefix) =>
        pathname === pathPrefix || pathname.startsWith(`${pathPrefix}/`)
    )
  }, [pathname])

  const handleConsentSelection = (value: TAdConsentValue) => {
    writeAdConsentValue(value)
    setConsentValue(value)
  }

  if (isHiddenPath || consentValue) {
    return null
  }

  if (
    session?.user?.id &&
    (isBillingLoading || billingData?.currentPlan === 'PRO')
  ) {
    return null
  }

  return (
    <section className="fixed inset-x-3 bottom-3 z-[90] sm:inset-x-6">
      <div className="mx-auto w-full max-w-5xl rounded-2xl border border-border/70 bg-card/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/15 text-primary">
              <Megaphone className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Ads are on by default in low-clutter areas
              </p>
              <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                We only place ads on public pages with extra whitespace and we
                never sell your financial account data. You can turn ads off at
                any time.
              </p>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Privacy details
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => handleConsentSelection('declined')}
            >
              Turn ads off
            </Button>
            <Button
              type="button"
              className="min-h-11"
              onClick={() => handleConsentSelection('accepted')}
            >
              Keep enabled
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
