import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppPlan } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { getStripePriceIdForPlan } from '@/lib/billing'
import { stripeClient } from '@/lib/stripe'
import { getUserEntitlements } from '@/lib/user-entitlements'
import {
  createRateLimitResponse,
  enforceRateLimit,
} from '@/lib/request-rate-limit'

const parsePlan = (value: unknown): AppPlan | null => {
  if (value === 'BASIC' || value === AppPlan.BASIC) {
    return AppPlan.BASIC
  }
  if (value === 'PRO' || value === AppPlan.PRO) {
    return AppPlan.PRO
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    if (!stripeClient) {
      return NextResponse.json(
        { error: 'Billing is temporarily unavailable.' },
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)
    if (session?.user?.id) {
      const rateLimit = await enforceRateLimit({
        request,
        scope: 'billing-checkout',
        maxRequests: 10,
        windowMs: 60 * 60 * 1000,
        userId: session.user.id,
      })
      if (rateLimit.isLimited) {
        return createRateLimitResponse(
          rateLimit,
          'Too many checkout attempts. Please try again later.'
        )
      }
    }

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const plan = parsePlan(body?.plan)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 })
    }

    const stripePriceId = getStripePriceIdForPlan(plan)
    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'Billing is temporarily unavailable.' },
        { status: 503 }
      )
    }

    const { isSuperUser, effectiveSubscription, subscriptions } =
      await getUserEntitlements(session.user.id)

    if (isSuperUser) {
      return NextResponse.json(
        { error: 'Superuser accounts already include full Pro access.' },
        { status: 400 }
      )
    }

    if (effectiveSubscription?.plan === plan) {
      return NextResponse.json(
        { error: `You are already on the ${plan.toLowerCase()} plan.` },
        { status: 400 }
      )
    }

    const userId = session.user.id
    const userEmail = session.user.email

    let stripeCustomerId =
      subscriptions.find((subscription) => subscription.stripeCustomerId)
        ?.stripeCustomerId ?? null

    if (!stripeCustomerId) {
      const customer = await stripeClient.customers.create({
        email: userEmail,
        metadata: {
          userId,
        },
      })
      stripeCustomerId = customer.id
    }

    // Only give a free trial to first-time subscribers. Plan changes or
    // resubscribing after cancel get no trial.
    const isFirstTimeSubscriber = subscriptions.length === 0
    const trialPeriodDays = isFirstTimeSubscriber ? 7 : 0

    const origin = request.nextUrl.origin
    const checkoutSession = await stripeClient.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        ...(trialPeriodDays > 0 && { trial_period_days: trialPeriodDays }),
        metadata: {
          userId,
          plan,
        },
      },
      metadata: {
        userId,
        plan,
      },
      success_url: `${origin}/billing?checkout=success`,
      cancel_url: `${origin}/billing?checkout=cancelled`,
    })

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    )
  }
}
