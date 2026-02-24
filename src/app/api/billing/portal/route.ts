import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripeClient } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const resolveApplicationOrigin = (request: NextRequest) => {
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (publicAppUrl) {
    try {
      return new URL(publicAppUrl).origin
    } catch {
      console.warn(
        'NEXT_PUBLIC_APP_URL is invalid for billing portal. Falling back to request origin.'
      )
    }
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim()
  if (nextAuthUrl) {
    try {
      return new URL(nextAuthUrl).origin
    } catch {
      console.warn(
        'NEXTAUTH_URL is invalid for billing portal. Falling back to request origin.'
      )
    }
  }

  return request.nextUrl.origin
}

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

    const origin = resolveApplicationOrigin(request)
    const portalSession = await stripeClient.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/billing`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    const stripeError = error as
      | {
          type?: string
          code?: string
          message?: string
          requestId?: string
          raw?: { message?: string }
        }
      | undefined
    console.error('Error creating customer portal session:', {
      type: stripeError?.type,
      code: stripeError?.code,
      message: stripeError?.message ?? stripeError?.raw?.message,
      requestId: stripeError?.requestId,
    })
    return NextResponse.json(
      { error: 'Failed to open billing portal.' },
      { status: 500 }
    )
  }
}
