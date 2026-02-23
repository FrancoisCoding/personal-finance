import { NextRequest, NextResponse } from 'next/server'
import { AppPlan, AppSubscriptionStatus } from '@prisma/client'
import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { stripeClient } from '@/lib/stripe'

const resolvePlanFromPrice = (priceId: string | null | undefined) => {
  if (!priceId) return null
  if (priceId === process.env.STRIPE_PRICE_PRO_MONTHLY) {
    return AppPlan.PRO
  }
  if (priceId === process.env.STRIPE_PRICE_BASIC_MONTHLY) {
    return AppPlan.BASIC
  }
  return null
}

const resolveStatus = (status: Stripe.Subscription.Status) => {
  if (status === 'active') return AppSubscriptionStatus.ACTIVE
  if (status === 'trialing') return AppSubscriptionStatus.TRIALING
  if (status === 'past_due') return AppSubscriptionStatus.PAST_DUE
  if (status === 'incomplete' || status === 'incomplete_expired') {
    return AppSubscriptionStatus.INCOMPLETE
  }
  if (status === 'canceled' || status === 'unpaid') {
    return AppSubscriptionStatus.CANCELED
  }
  return AppSubscriptionStatus.INCOMPLETE
}

const toDate = (unixTimestamp: number | null | undefined) => {
  if (!unixTimestamp) return null
  return new Date(unixTimestamp * 1000)
}

const upsertFromStripeSubscription = async (
  subscription: Stripe.Subscription
) => {
  const userId = subscription.metadata?.userId
  if (!userId) return

  const subscriptionPriceId = subscription.items.data[0]?.price?.id
  const plan =
    (subscription.metadata?.plan as AppPlan | undefined) ??
    resolvePlanFromPrice(subscriptionPriceId)

  if (!plan) return

  await prisma.appSubscription.upsert({
    where: {
      stripeSubscriptionId: subscription.id,
    },
    create: {
      userId,
      plan,
      status: resolveStatus(subscription.status),
      stripeCustomerId:
        typeof subscription.customer === 'string'
          ? subscription.customer
          : (subscription.customer?.id ?? null),
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscriptionPriceId ?? null,
      trialEndsAt: toDate(subscription.trial_end),
      currentPeriodEnd: toDate(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    update: {
      userId,
      plan,
      status: resolveStatus(subscription.status),
      stripeCustomerId:
        typeof subscription.customer === 'string'
          ? subscription.customer
          : (subscription.customer?.id ?? null),
      stripePriceId: subscriptionPriceId ?? null,
      trialEndsAt: toDate(subscription.trial_end),
      currentPeriodEnd: toDate(subscription.current_period_end),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!stripeClient || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Stripe webhook is not configured.' },
        { status: 500 }
      )
    }

    const signature = request.headers.get('stripe-signature')
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature.' },
        { status: 400 }
      )
    }

    const requestBody = await request.text()
    const event = stripeClient.webhooks.constructEvent(
      requestBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        const stripeSubscriptionId =
          typeof checkoutSession.subscription === 'string'
            ? checkoutSession.subscription
            : checkoutSession.subscription?.id

        if (!stripeSubscriptionId) {
          break
        }

        const subscription =
          await stripeClient.subscriptions.retrieve(stripeSubscriptionId)
        await upsertFromStripeSubscription(subscription)

        // Ensure only one active subscription per user: cancel any other active
        // subscriptions (upgrade/downgrade creates a new subscription).
        const userId = subscription.metadata?.userId as string | undefined
        if (userId && stripeClient) {
          const others = await prisma.appSubscription.findMany({
            where: {
              userId,
              stripeSubscriptionId: { not: stripeSubscriptionId },
              status: {
                in: [
                  AppSubscriptionStatus.ACTIVE,
                  AppSubscriptionStatus.TRIALING,
                ],
              },
            },
          })
          for (const other of others) {
            if (other.stripeSubscriptionId) {
              try {
                await stripeClient.subscriptions.cancel(
                  other.stripeSubscriptionId
                )
              } catch (err) {
                console.error(
                  'Failed to cancel previous subscription:',
                  other.stripeSubscriptionId,
                  err
                )
              }
            }
          }
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await upsertFromStripeSubscription(subscription)
        break
      }
      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    )
  }
}
