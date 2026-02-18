'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useBillingStatus } from '@/hooks/use-billing-status'
import { useToast } from '@/hooks/use-toast'

const planOrder = ['BASIC', 'PRO'] as const

export default function BillingPage() {
  const { toast } = useToast()
  const { data, isLoading, refetch } = useBillingStatus()
  const [isSubmittingPlan, setIsSubmittingPlan] = useState<string | null>(null)

  const handleStartCheckout = async (plan: 'BASIC' | 'PRO') => {
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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">Loading plan options...</p>
      </div>
    )
  }

  const currentPlan = data?.currentPlan
  const availablePlans =
    data?.availablePlans.sort((left, right) => {
      return (
        planOrder.indexOf(left.plan as (typeof planOrder)[number]) -
        planOrder.indexOf(right.plan as (typeof planOrder)[number])
      )
    }) ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Subscription plans</h1>
        <p className="text-sm text-muted-foreground">
          Choose between Starter and Pro. Both include a 7-day free trial.
        </p>
      </div>

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
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {availablePlans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.plan
          const isSubmitting = isSubmittingPlan === plan.plan
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
                    disabled={isCurrentPlan || isSubmitting}
                    className="min-h-11"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting...
                      </>
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
