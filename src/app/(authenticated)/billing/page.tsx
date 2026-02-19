'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBillingStatus } from '@/hooks/use-billing-status'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { useToast } from '@/hooks/use-toast'

const planOrder = ['BASIC', 'PRO'] as const
const publicPlanCatalog = [
  {
    plan: 'BASIC',
    name: 'Starter',
    monthlyPriceLabel: '$5/mo',
    description: 'Core finance tracking with structured monthly planning.',
    featureList: [
      'Accounts and transactions',
      'Budgets and reminders',
      'Subscription tracking',
      '7-day free trial',
    ],
  },
  {
    plan: 'PRO',
    name: 'Pro',
    monthlyPriceLabel: '$10/mo',
    description:
      'Everything in Starter plus premium AI guidance and power-user features.',
    featureList: [
      'Everything in Starter',
      'Financial Assistant access',
      'Advanced AI insights',
      'Subscription optimizer',
      'Credit score lab & report',
      'Priority support',
      '7-day free trial',
    ],
  },
] as const

export default function BillingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const { startDemoMode } = useDemoMode()
  const { toast } = useToast()
  const { data, isLoading, refetch } = useBillingStatus()
  const [isSubmittingPlan, setIsSubmittingPlan] = useState<string | null>(null)
  const [isOpeningPortal, setIsOpeningPortal] = useState(false)

  const handleStartCheckout = async (plan: 'BASIC' | 'PRO') => {
    if (!session?.user?.id) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent('/billing')}`)
      return
    }

    setIsSubmittingPlan(plan)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to start checkout.')
      }
      if (!payload?.checkoutUrl) {
        throw new Error('Checkout session URL was not returned.')
      }
      window.location.href = payload.checkoutUrl as string
    } catch (error) {
      toast({
        title: 'Billing error',
        description:
          error instanceof Error ? error.message : 'Unable to start checkout.',
        variant: 'destructive',
      })
      setIsSubmittingPlan(null)
    }
  }

  const handleOpenCustomerPortal = async () => {
    if (!session?.user?.id) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent('/billing')}`)
      return
    }

    setIsOpeningPortal(true)
    try {
      const response = await fetch('/api/billing/portal', { method: 'POST' })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to open customer portal.')
      }
      if (!payload?.url) {
        throw new Error('Customer portal URL was not returned.')
      }
      window.location.href = payload.url as string
    } catch (error) {
      toast({
        title: 'Billing error',
        description:
          error instanceof Error
            ? error.message
            : 'Unable to open customer portal.',
        variant: 'destructive',
      })
      setIsOpeningPortal(false)
    }
  }

  const handleStartDemoMode = () => {
    startDemoMode()
    router.push('/dashboard?demo=1')
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">Loading plan options...</p>
      </div>
    )
  }

  const currentPlan = data?.currentPlan
  const isSuperUser = data?.isSuperUser === true
  const availablePlans =
    data?.availablePlans.slice().sort((left, right) => {
      return (
        planOrder.indexOf(left.plan as (typeof planOrder)[number]) -
        planOrder.indexOf(right.plan as (typeof planOrder)[number])
      )
    }) ?? publicPlanCatalog
  const isLockedAccess = searchParams.get('locked') === '1'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Subscription plans</h1>
        <p className="text-sm text-muted-foreground">
          Choose between Starter and Pro. Both include a 7-day free trial.
        </p>
      </div>

      {isLockedAccess ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
          Your account is in live-locked mode until you choose a paid plan. You
          can still continue in demo mode anytime.
        </div>
      ) : null}

      {isSuperUser ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          Superuser access is active on this account. Pro features are enabled
          without billing.
        </div>
      ) : null}

      {data?.currentSubscription ? (
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-lg">Current subscription</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Plan:{' '}
              <span className="font-medium text-foreground">{currentPlan}</span>
            </p>
            <p>Status: {data.currentSubscription.status}</p>
            {data.currentSubscription.trialEndsAt ? (
              <p>
                Trial ends:{' '}
                {new Date(
                  data.currentSubscription.trialEndsAt
                ).toLocaleDateString()}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="min-h-11"
                onClick={handleOpenCustomerPortal}
                disabled={isOpeningPortal}
              >
                {isOpeningPortal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening portal...
                  </>
                ) : (
                  'Manage subscription'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-xl">Demo mode</CardTitle>
            <p className="text-sm text-muted-foreground">
              Explore the full interface with curated sample data before paying.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                <span>Instant access, no payment required</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                <span>Sample transactions and walkthrough</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                <span>Safe environment for trying features</span>
              </li>
            </ul>
            <Button
              variant="outline"
              className="min-h-11"
              onClick={handleStartDemoMode}
            >
              Enter demo mode
            </Button>
          </CardContent>
        </Card>

        {availablePlans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.plan
          const isSubmitting = isSubmittingPlan === plan.plan
          const isDisabled = isSuperUser || isCurrentPlan || isSubmitting
          return (
            <Card
              key={plan.plan}
              className={
                'border-border/70 bg-card/90 ' +
                (plan.plan === 'PRO' ? 'ring-1 ring-emerald-500/40' : '')
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl">
                  <span>{plan.name}</span>
                  <span className="text-base text-emerald-400">
                    {plan.monthlyPriceLabel}
                  </span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.featureList.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      handleStartCheckout(plan.plan as 'BASIC' | 'PRO')
                    }
                    disabled={isDisabled}
                    className="min-h-11"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : isSuperUser ? (
                      'Superuser access enabled'
                    ) : isCurrentPlan ? (
                      'Current plan'
                    ) : (
                      `Start ${plan.name} trial`
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => refetch()}>
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
