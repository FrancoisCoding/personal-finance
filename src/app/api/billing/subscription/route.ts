import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppPlan } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import {
  planDefinitions,
  getEffectivePlanFromSubscriptions,
} from '@/lib/billing'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptions = await prisma.appSubscription.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    })

    const effectiveSubscription =
      getEffectivePlanFromSubscriptions(subscriptions)
    const currentPlan = effectiveSubscription?.plan ?? null

    return NextResponse.json({
      currentPlan,
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
      availablePlans: [AppPlan.BASIC, AppPlan.PRO].map((plan) => ({
        ...planDefinitions[plan],
      })),
    })
  } catch (error) {
    console.error('Error fetching subscription status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription status.' },
      { status: 500 }
    )
  }
}
