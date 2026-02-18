import {
  AppPlan,
  AppSubscriptionStatus,
  type AppSubscription,
} from '@prisma/client'

export interface IPlanDefinition {
  plan: AppPlan
  name: string
  monthlyPriceInCents: number
  monthlyPriceLabel: string
  description: string
  featureList: string[]
}

export const planDefinitions: Record<AppPlan, IPlanDefinition> = {
  [AppPlan.BASIC]: {
    plan: AppPlan.BASIC,
    name: 'Starter',
    monthlyPriceInCents: 500,
    monthlyPriceLabel: '$5/mo',
    description: 'Core finance tracking with structured monthly planning.',
    featureList: [
      'Accounts and transactions',
      'Budgets and reminders',
      'Subscription tracking',
      '7-day free trial',
    ],
  },
  [AppPlan.PRO]: {
    plan: AppPlan.PRO,
    name: 'Pro',
    monthlyPriceInCents: 1000,
    monthlyPriceLabel: '$10/mo',
    description:
      'Everything in Starter plus premium AI guidance and power-user features.',
    featureList: [
      'Everything in Starter',
      'Financial Assistant access',
      'Advanced AI insights',
      'Priority support',
      '7-day free trial',
    ],
  },
}

export const billingFeatureRequirements = {
  financialAssistant: AppPlan.PRO,
  advancedInsights: AppPlan.PRO,
} as const

export const getStripePriceIdForPlan = (plan: AppPlan) => {
  if (plan === AppPlan.BASIC) {
    return process.env.STRIPE_PRICE_BASIC_MONTHLY ?? ''
  }

  return process.env.STRIPE_PRICE_PRO_MONTHLY ?? ''
}

export const isActiveSubscriptionStatus = (status: AppSubscriptionStatus) => {
  return (
    status === AppSubscriptionStatus.ACTIVE ||
    status === AppSubscriptionStatus.TRIALING
  )
}

export const comparePlanPriority = (plan: AppPlan) => {
  return plan === AppPlan.PRO ? 2 : 1
}

export const getEffectivePlanFromSubscriptions = (
  subscriptions: AppSubscription[]
) => {
  const activeSubscriptions = subscriptions.filter((subscription) =>
    isActiveSubscriptionStatus(subscription.status)
  )
  if (activeSubscriptions.length === 0) {
    return null
  }

  return activeSubscriptions.sort((left, right) => {
    return comparePlanPriority(right.plan) - comparePlanPriority(left.plan)
  })[0]
}

export const hasFeatureAccess = (
  subscriptions: AppSubscription[],
  requiredPlan: AppPlan
) => {
  const activeSubscription = getEffectivePlanFromSubscriptions(subscriptions)
  if (!activeSubscription) {
    return false
  }

  return (
    comparePlanPriority(activeSubscription.plan) >=
    comparePlanPriority(requiredPlan)
  )
}
