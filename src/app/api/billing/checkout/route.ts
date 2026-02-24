import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppPlan } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { getStripePriceIdForPlan, type TBillingInterval } from '@/lib/billing'
import { stripeClient } from '@/lib/stripe'
import { getUserEntitlements } from '@/lib/user-entitlements'
import {
  createRateLimitResponse,
  enforceRateLimit,
} from '@/lib/request-rate-limit'

const resolveApplicationOrigin = (request: NextRequest) => {
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (publicAppUrl) {
    try {
      return new URL(publicAppUrl).origin
    } catch {
      console.warn(
        'NEXT_PUBLIC_APP_URL is invalid for billing checkout. Falling back to request origin.'
      )
    }
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim()
  if (nextAuthUrl) {
    try {
      return new URL(nextAuthUrl).origin
    } catch {
      console.warn(
        'NEXTAUTH_URL is invalid for billing checkout. Falling back to request origin.'
      )
    }
  }

  return request.nextUrl.origin
}

const parsePlan = (value: unknown): AppPlan | null => {
  if (value === 'BASIC' || value === AppPlan.BASIC) {
    return AppPlan.BASIC
  }
  if (value === 'PRO' || value === AppPlan.PRO) {
    return AppPlan.PRO
  }
  return null
}

const parseBillingInterval = (value: unknown): TBillingInterval => {
  return value === 'annual' ? 'annual' : 'monthly'
}

const isMissingStripeCustomerError = (error: unknown) => {
  const stripeError = error as
    | {
        code?: string
        param?: string
        raw?: { param?: string }
      }
    | undefined

  return (
    stripeError?.code === 'resource_missing' &&
    (stripeError?.param === 'customer' ||
      stripeError?.raw?.param === 'customer')
  )
}

const isStripeTrialConflictError = (error: unknown) => {
  const stripeError = error as
    | {
        param?: string
        message?: string
        raw?: { param?: string; message?: string }
      }
    | undefined

  const param = stripeError?.param ?? stripeError?.raw?.param
  if (param === 'subscription_data[trial_period_days]') {
    return true
  }

  const message = (
    stripeError?.message ??
    stripeError?.raw?.message ??
    ''
  ).toLowerCase()
  return (
    message.includes('trial') &&
    (message.includes('price') || message.includes('subscription_data'))
  )
}

export async function POST(request: NextRequest) {
  try {
    if (!stripeClient) {
      return NextResponse.json(
        { error: 'Billing is temporarily unavailable.' },
        { status: 503 }
      )
    }
    const stripe = stripeClient

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
    const billingInterval = parseBillingInterval(body?.billingInterval)

    const stripePriceId = getStripePriceIdForPlan(plan, billingInterval)
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
      const customer = await stripe.customers.create({
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

    const origin = resolveApplicationOrigin(request)
    const createCheckoutSession = async (
      customerId: string,
      includeTrialPeriod: boolean
    ) => {
      return stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            price: stripePriceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          ...(includeTrialPeriod &&
            trialPeriodDays > 0 && { trial_period_days: trialPeriodDays }),
          metadata: {
            userId,
            plan,
            billingInterval,
          },
        },
        metadata: {
          userId,
          plan,
          billingInterval,
        },
        success_url: `${origin}/billing?checkout=success`,
        cancel_url: `${origin}/billing?checkout=cancelled`,
      })
    }

    const createCheckoutSessionWithFallbacks = async (customerId: string) => {
      try {
        return await createCheckoutSession(customerId, true)
      } catch (error) {
        if (!isStripeTrialConflictError(error) || trialPeriodDays <= 0) {
          throw error
        }

        console.warn(
          'Stripe checkout trial configuration conflict detected. Retrying without trial_period_days.'
        )
        return createCheckoutSession(customerId, false)
      }
    }

    let checkoutSession
    try {
      checkoutSession =
        await createCheckoutSessionWithFallbacks(stripeCustomerId)
    } catch (error) {
      if (!isMissingStripeCustomerError(error)) {
        throw error
      }

      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId,
          recreatedFor: 'checkout_missing_customer',
        },
      })
      stripeCustomerId = customer.id
      checkoutSession =
        await createCheckoutSessionWithFallbacks(stripeCustomerId)
    }

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
    })
  } catch (error) {
    const stripeError = error as
      | {
          type?: string
          code?: string
          param?: string
          message?: string
          requestId?: string
          raw?: { message?: string; param?: string }
        }
      | undefined
    console.error('Error creating checkout session:', {
      type: stripeError?.type,
      code: stripeError?.code,
      param: stripeError?.param ?? stripeError?.raw?.param,
      message: stripeError?.message ?? stripeError?.raw?.message,
      requestId: stripeError?.requestId,
      priceIdPlanMode: {
        isLiveSecretKey:
          process.env.STRIPE_SECRET_KEY?.trim().startsWith('sk_live_'),
        basicPriceConfigured: Boolean(
          process.env.STRIPE_PRICE_BASIC_MONTHLY?.trim()
        ),
        basicAnnualPriceConfigured: Boolean(
          process.env.STRIPE_PRICE_BASIC_YEARLY?.trim()
        ),
        proPriceConfigured: Boolean(
          process.env.STRIPE_PRICE_PRO_MONTHLY?.trim()
        ),
        proAnnualPriceConfigured: Boolean(
          process.env.STRIPE_PRICE_PRO_YEARLY?.trim()
        ),
      },
    })
    const isDevelopment = process.env.NODE_ENV !== 'production'
    return NextResponse.json(
      isDevelopment
        ? {
            error: 'Failed to create checkout session.',
            debug: {
              code: stripeError?.code,
              param: stripeError?.param ?? stripeError?.raw?.param,
              message: stripeError?.message ?? stripeError?.raw?.message,
              requestId: stripeError?.requestId,
            },
          }
        : { error: 'Failed to create checkout session.' },
      { status: 500 }
    )
  }
}
