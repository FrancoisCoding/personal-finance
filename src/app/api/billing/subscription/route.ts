import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppPlan } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { getStripePriceIdForPlan, planDefinitions } from '@/lib/billing'
import { stripeClient } from '@/lib/stripe'
import { getUserEntitlements } from '@/lib/user-entitlements'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { isSuperUser, currentPlan, effectiveSubscription } =
      await getUserEntitlements(session.user.id)
    const effectiveCurrentPlan = currentPlan ?? 'FREE'
    const isStripePortalConfigured = Boolean(stripeClient)
    const isStripeCheckoutConfigured = Boolean(
      stripeClient &&
        getStripePriceIdForPlan(AppPlan.BASIC) &&
        getStripePriceIdForPlan(AppPlan.PRO)
    )

    return NextResponse.json({
      currentPlan: effectiveCurrentPlan,
      isSuperUser,
      isStripePortalConfigured,
      isStripeCheckoutConfigured,
      currentSubscription: effectiveSubscription
        ? {
            id: effectiveSubscription.id,
            plan: effectiveSubscription.plan,
            status: effectiveSubscription.status,
            trialEndsAt:
              effectiveSubscription.trialEndsAt?.toISOString() ?? null,
            currentPeriodEnd:
              effectiveSubscription.currentPeriodEnd?.toISOString() ?? null,
            cancelAtPeriodEnd: effectiveSubscription.cancelAtPeriodEnd,
          }
        : null,
      availablePlans: [
        {
          plan: 'FREE',
          name: 'Free',
          monthlyPriceInCents: 0,
          monthlyPriceLabel: '$0/mo',
          description:
            'A limited live plan with access to Overview and Accounts only.',
          featureList: [
            'Live Overview and Accounts pages',
            'Basic balance and recent transaction visibility',
            'Use Billing anytime to upgrade',
            'Other features require Basic or Pro',
          ],
        },
        ...[AppPlan.BASIC, AppPlan.PRO].map((plan) => ({
          ...planDefinitions[plan],
        })),
      ],
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status.' },
      { status: 500 }
    )
  }
}
