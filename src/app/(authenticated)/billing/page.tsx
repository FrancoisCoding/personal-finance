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

const planOrder = ['FREE', 'BASIC', 'PRO'] as const
const publicPlanCatalog = [
  {
    plan: 'FREE',
    name: 'Free',
    monthlyPriceLabel: '$0/mo',
    description:
      'A lightweight live plan for basic tracking, limited interactions, and starter insights.',
    featureList: [
      'Core dashboard, accounts, transactions, and budgets',
      'Starter insights and recommendations',
      'Limited daily interactions',
      'Upgrade anytime to unlock more automation and AI usage',
    ],
  },
  {
    plan: 'BASIC',
    name: 'Basic',
    monthlyPriceLabel: '$4/mo',
    description: 'Core finance tracking with structured monthly planning.',
    featureList: [
      'Accounts and transactions',
      'Budgets and reminders',
      'Subscription tracking',
      'AI Assistant access for everyday questions and planning.',
      '7-day free trial',
    ],
  },
  {
    plan: 'PRO',
    name: 'Pro',
    monthlyPriceLabel: '$9/mo',
    description:
      'Everything in Basic plus premium AI guidance and power-user features.',
    featureList: [
      'Everything in Basic',
      'More AI Assistant access for frequent conversations and deeper planning.',
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
  const { startDemoMode, isDemoMode } = useDemoMode()
  const { toast } = useToast()
  const { data, isLoading } = useBillingStatus()
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

  const currentPlan = data?.currentPlan ?? null
  const activeLivePlan = currentPlan ?? 'FREE'
  const isSuperUser = data?.isSuperUser === true
  const isStripeCheckoutConfigured = data?.isStripeCheckoutConfigured === true
  const isStripePortalConfigured = data?.isStripePortalConfigured === true
  const hasPaidSubscription = Boolean(data?.currentSubscription)
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
          Start on Free, or upgrade to Basic or Pro. Paid plans include a 7-day
          free trial.
        </p>
      </div>

      {isLockedAccess ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-300">
          Your account is currently on the Free plan. Upgrade anytime for more
          AI access and premium features, or continue in demo mode.
        </div>
      ) : null}

      {isSuperUser ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          Superuser access is active on this account. Pro features are enabled
          without billing.
        </div>
      ) : null}

      {!isSuperUser && !isStripeCheckoutConfigured ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Paid plan checkout is temporarily unavailable right now. You can
          continue using demo mode and try again later.
        </div>
      ) : null}

      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Current access</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Active plan:{' '}
            <span className="font-medium text-foreground">
              {isDemoMode
                ? 'DEMO'
                : isSuperUser
                  ? 'PRO (Superuser)'
                  : activeLivePlan}
            </span>
          </p>
          {data?.currentSubscription ? (
            <>
              <p>Status: {data.currentSubscription.status}</p>
              {data.currentSubscription.trialEndsAt ? (
                <p>
                  Trial ends:{' '}
                  {new Date(
                    data.currentSubscription.trialEndsAt
                  ).toLocaleDateString()}
                </p>
              ) : null}
            </>
          ) : !isDemoMode ? (
            <p>
              {activeLivePlan === 'FREE'
                ? 'You can continue using the Free plan and upgrade anytime.'
                : 'No active paid subscription found.'}
            </p>
          ) : (
            <p>
              Demo mode uses sample data and does not create a live
              subscription.
            </p>
          )}
          {data?.currentSubscription ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="min-h-11"
                onClick={handleOpenCustomerPortal}
                disabled={isOpeningPortal || !isStripePortalConfigured}
              >
                {isOpeningPortal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Opening portal...
                  </>
                ) : !isStripePortalConfigured ? (
                  'Portal unavailable'
                ) : (
                  'Manage subscription'
                )}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-border/70 bg-card/90">
          <CardHeader>
            <CardTitle className="text-xl">Demo mode</CardTitle>
            <p className="text-sm text-muted-foreground">
              Explore the full interface with curated sample data before paying.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2 text-balance">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span>Instant access, no payment required</span>
              </li>
              <li className="flex items-start gap-2 text-balance">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span>Sample transactions and walkthrough</span>
              </li>
              <li className="flex items-start gap-2 text-balance">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span>Safe environment for trying features</span>
              </li>
              <li className="flex items-start gap-2 text-balance">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <span>AI Assistant chat is disabled in demo mode</span>
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
          const isFreePlan = plan.plan === 'FREE'
          const isPopularPlan = plan.plan === 'PRO'
          const isCurrentPlan = activeLivePlan === plan.plan
          const isSubmitting = isSubmittingPlan === plan.plan
          const isDowngradeViaPortal = isFreePlan && hasPaidSubscription
          const isDisabled =
            isSuperUser ||
            isCurrentPlan ||
            isSubmitting ||
            (isDowngradeViaPortal &&
              (isOpeningPortal || !isStripePortalConfigured)) ||
            (!isFreePlan && !isStripeCheckoutConfigured)
          return (
            <Card
              key={plan.plan}
              className={
                'relative border-border/70 bg-card/90 transition-colors ' +
                (isPopularPlan
                  ? 'border-emerald-400/50 bg-gradient-to-b from-emerald-500/[0.07] via-card/95 to-card/95 shadow-[0_18px_45px_-28px_rgba(16,185,129,0.6)] ring-1 ring-emerald-400/35'
                  : '')
              }
            >
              {isPopularPlan ? (
                <div className="absolute inset-x-4 -top-3 flex justify-center">
                  <span className="inline-flex min-h-7 items-center rounded-full border border-emerald-300/35 bg-emerald-400 px-3.5 py-1 text-xs font-semibold tracking-[0.08em] text-slate-950 shadow-sm shadow-emerald-950/20">
                    Most popular
                  </span>
                </div>
              ) : null}
              <CardHeader>
                {isPopularPlan ? (
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/90">
                    Best value for active users
                  </p>
                ) : null}
                <CardTitle className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-lg">
                      <span>{plan.name}</span>
                      {isCurrentPlan ? (
                        <span className="rounded-full border border-emerald-400/35 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                          Current
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <span
                    className={
                      'block text-3xl font-semibold tracking-tight sm:text-4xl ' +
                      (isPopularPlan ? 'text-emerald-200' : 'text-foreground')
                    }
                  >
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
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-balance"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      if (isFreePlan) {
                        if (isDowngradeViaPortal) {
                          void handleOpenCustomerPortal()
                          return
                        }
                        router.push('/dashboard')
                        return
                      }
                      handleStartCheckout(plan.plan as 'BASIC' | 'PRO')
                    }}
                    disabled={isDisabled}
                    className={
                      'min-h-11 ' +
                      (isPopularPlan
                        ? 'w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                        : '')
                    }
                    variant={isPopularPlan ? 'default' : 'outline'}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
                    ) : isSuperUser ? (
                      'Superuser access enabled'
                    ) : isFreePlan && isCurrentPlan ? (
                      'Current plan'
                    ) : isFreePlan && isDowngradeViaPortal ? (
                      isOpeningPortal ? (
                        'Opening portal...'
                      ) : isStripePortalConfigured ? (
                        'Manage in billing'
                      ) : (
                        'Portal unavailable'
                      )
                    ) : isFreePlan ? (
                      'Continue with Free'
                    ) : !isStripeCheckoutConfigured ? (
                      'Billing unavailable'
                    ) : isCurrentPlan ? (
                      'Current plan'
                    ) : isPopularPlan ? (
                      'Start Pro trial'
                    ) : (
                      `Start ${plan.name} trial`
                    )}
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
