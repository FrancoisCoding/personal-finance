import { NextRequest, NextResponse } from 'next/server'
import { AppSubscriptionStatus } from '@prisma/client'
import {
  adminSessionCookieName,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get(adminSessionCookieName)?.value
    if (!verifyAdminSessionToken(adminToken)) {
      return unauthorizedResponse()
    }

    const [
      usersCount,
      contactsCount,
      activeSessionsCount,
      activeSubscriptions,
      trialingSubscriptions,
      subscriptions,
      recentSessions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.contactSubmission.count(),
      prisma.accessSession.count({
        where: {
          lastActiveAt: {
            gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          },
        },
      }),
      prisma.appSubscription.count({
        where: { status: AppSubscriptionStatus.ACTIVE },
      }),
      prisma.appSubscription.count({
        where: { status: AppSubscriptionStatus.TRIALING },
      }),
      prisma.appSubscription.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 100,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.accessSession.findMany({
        orderBy: { lastActiveAt: 'desc' },
        take: 100,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      summary: {
        usersCount,
        contactsCount,
        activeSessionsCount,
        activeSubscriptions,
        trialingSubscriptions,
      },
      subscriptions: subscriptions.map((subscription) => ({
        id: subscription.id,
        plan: subscription.plan,
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt?.toISOString() ?? null,
        currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        updatedAt: subscription.updatedAt.toISOString(),
        user: subscription.user,
      })),
      sessions: recentSessions.map((session) => ({
        id: session.id,
        sessionKey: session.sessionKey,
        name: session.name,
        location: session.location,
        isTrusted: session.isTrusted,
        lastActiveAt: session.lastActiveAt.toISOString(),
        user: session.user,
      })),
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to load admin analytics.' },
      { status: 500 }
    )
  }
}
