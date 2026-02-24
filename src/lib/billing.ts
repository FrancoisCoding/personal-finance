import {
  AppPlan,
  AppSubscriptionStatus,
  type AppSubscription,
} from '@prisma/client'
import { aiChatPlanMessaging } from '@/lib/ai-chat-rate-limits'

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
    name: 'Basic',
    monthlyPriceInCents: 400,
    monthlyPriceLabel: '$4/mo',
    description: 'Core finance tracking with structured monthly planning.',
    featureList: [
      'Accounts and transactions',
      'Budgets and reminders',
      'Subscription tracking',
      aiChatPlanMessaging.BASIC,
      '7-day free trial',
    ],
  },
  [AppPlan.PRO]: {
    plan: AppPlan.PRO,
    name: 'Pro',
    monthlyPriceInCents: 900,
    monthlyPriceLabel: '$9/mo',
    description:
      'Everything in Basic plus premium AI guidance and power-user features.',
    featureList: [
      'Everything in Basic',
      aiChatPlanMessaging.PRO,
      'Advanced AI insights',
      'Subscription optimizer',
      'Credit score lab & report',
      'Priority support',
      '7-day free trial',
    ],
  },
}

export const billingFeatureRequirements = {
  financialAssistant: AppPlan.BASIC,
  advancedInsights: AppPlan.PRO,
  creditScoreLab: AppPlan.PRO,
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
