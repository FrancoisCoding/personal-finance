'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
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
      'Upgrade anytime for more automation and AI access',
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

export default function PlansPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { data: session } = useSession()
  const { startDemoMode } = useDemoMode()
  const { data, isLoading } = useBillingStatus()
  const [isSubmittingPlan, setIsSubmittingPlan] = useState<string | null>(null)

  const handleEnterDemo = () => {
    startDemoMode()
    router.push('/dashboard?demo=1')
  }

  const handleSelectPlan = async (plan: 'BASIC' | 'PRO') => {
    if (!session?.user?.id) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent('/plans')}`)
      return
    }

    setIsSubmittingPlan(plan)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const availablePlans =
    data?.availablePlans.slice().sort((left, right) => {
      return (
        planOrder.indexOf(left.plan as (typeof planOrder)[number]) -
        planOrder.indexOf(right.plan as (typeof planOrder)[number])
      )
    }) ?? publicPlanCatalog

  const currentPlan = session?.user?.id ? (data?.currentPlan ?? 'FREE') : null
  const isSuperUser = data?.isSuperUser === true
  const shouldShowPlanLoading = Boolean(session?.user?.id) && isLoading

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-20 sm:px-6 lg:px-8"
      >
        <section className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Access options
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Choose how you want to use FinanceFlow
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Start in demo mode, use the Free plan for core tracking, or upgrade
            to Basic or Pro for more AI and advanced features.
          </p>
          {currentPlan ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              {isSuperUser
                ? 'You have superuser access with full Pro features.'
                : `Your current live plan is ${currentPlan}.`}
              <Button
                variant="link"
                className="ml-1 h-auto px-1 text-emerald-200"
                onClick={() => router.push('/dashboard')}
              >
                Open dashboard
              </Button>
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="border-border/70 bg-card/90">
            <CardHeader>
              <CardTitle className="text-xl">Demo mode</CardTitle>
              <p className="text-sm text-muted-foreground">
                Explore the experience with curated sample data.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2 text-balance">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span>No subscription required</span>
                </li>
                <li className="flex items-start gap-2 text-balance">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span>Guided product walkthrough</span>
                </li>
                <li className="flex items-start gap-2 text-balance">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span>Ideal for evaluation and recruiting demos</span>
                </li>
                <li className="flex items-start gap-2 text-balance">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span>AI Assistant chat is disabled in demo mode</span>
                </li>
              </ul>
              <Button
                variant="outline"
                className="min-h-11"
                onClick={handleEnterDemo}
              >
                Enter demo mode
              </Button>
            </CardContent>
          </Card>

          {shouldShowPlanLoading ? (
            <Card className="border-border/70 bg-card/90 lg:col-span-2">
              <CardContent className="flex min-h-[220px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : (
            availablePlans.map((plan) => {
              const isFreePlan = plan.plan === 'FREE'
              const isPopularPlan = plan.plan === 'PRO'
              const isCurrentPlan = currentPlan === plan.plan
              const isSubmitting = isSubmittingPlan === plan.plan
              const isDisabled = isSuperUser || isCurrentPlan || isSubmitting
              return (
                <Card
                  key={plan.plan}
                  className={
                    'relative border-border/70 bg-card/90 ' +
                    (isPopularPlan ? 'ring-1 ring-emerald-500/40' : '')
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
                          (isPopularPlan
                            ? 'text-emerald-200'
                            : 'text-foreground')
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
                    <Button
                      className={
                        'min-h-11 ' +
                        (isPopularPlan
                          ? 'w-full bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                          : '')
                      }
                      variant={isPopularPlan ? 'default' : 'outline'}
                      disabled={isDisabled}
                      onClick={() => {
                        if (isFreePlan) {
                          if (!session?.user?.id) {
                            router.push(
                              `/auth/register?callbackUrl=${encodeURIComponent('/dashboard')}`
                            )
                            return
                          }
                          if (isCurrentPlan) {
                            router.push('/dashboard')
                            return
                          }
                          router.push('/billing')
                          return
                        }
                        handleSelectPlan(plan.plan as 'BASIC' | 'PRO')
                      }}
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
                      ) : isFreePlan ? (
                        session?.user?.id ? (
                          'Manage in billing'
                        ) : (
                          'Get started free'
                        )
                      ) : isCurrentPlan ? (
                        'Current plan'
                      ) : session?.user?.id ? (
                        `Sign up for ${plan.name}`
                      ) : (
                        `Sign in for ${plan.name}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })
          )}
        </section>

        <div className="text-sm text-muted-foreground">
          Already a member?{' '}
          <Link href="/auth/login" className="text-foreground underline">
            Sign in
          </Link>{' '}
          or manage your plan from{' '}
          <Link href="/billing" className="text-foreground underline">
            billing
          </Link>
          .
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
