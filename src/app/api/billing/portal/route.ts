import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripeClient } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    if (!stripeClient) {
      return NextResponse.json(
        { error: 'Billing portal is temporarily unavailable.' },
        { status: 503 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await prisma.appSubscription.findFirst({
      where: {
        userId: session.user.id,
        stripeCustomerId: { not: null },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const stripeCustomerId = subscription?.stripeCustomerId
    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found for this profile.' },
        { status: 400 }
      )
    }

    const origin = request.nextUrl.origin
    const portalSession = await stripeClient.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating customer portal session:', error)
    return NextResponse.json(
      { error: 'Failed to open billing portal.' },
      { status: 500 }
    )
  }
}
