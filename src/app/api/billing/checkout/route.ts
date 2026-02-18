import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppPlan } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { getStripePriceIdForPlan } from '@/lib/billing'
import { stripeClient } from '@/lib/stripe'
import { getUserEntitlements } from '@/lib/user-entitlements'

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
        { error: 'Stripe is not configured.' },
        { status: 500 }
      )
    }

    const session = await getServerSession(authOptions)
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
        { error: 'Missing Stripe price configuration.' },
        { status: 500 }
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

    let stripeCustomerId =
      subscriptions.find((subscription) => subscription.stripeCustomerId)
        ?.stripeCustomerId ?? null

    if (!stripeCustomerId) {
      const customer = await stripeClient.customers.create({
        email: session.user.email,
        metadata: {
          userId: session.user.id,
        },
      })
      stripeCustomerId = customer.id
    }

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
        trial_period_days: 7,
        metadata: {
          userId: session.user.id,
          plan,
        },
      },
      metadata: {
        userId: session.user.id,
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
