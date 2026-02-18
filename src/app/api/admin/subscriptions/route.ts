import { NextRequest, NextResponse } from 'next/server'
import {
  adminSessionCookieName,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const clampNumber = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

const parsePageValue = (value: string | null, fallback: number) => {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get(adminSessionCookieName)?.value
    if (!verifyAdminSessionToken(adminToken)) {
      return unauthorizedResponse()
    }

    const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''
    const page = clampNumber(
      parsePageValue(request.nextUrl.searchParams.get('page'), 1),
      1,
      10_000
    )
    const pageSize = clampNumber(
      parsePageValue(request.nextUrl.searchParams.get('pageSize'), 25),
      10,
      100
    )

    const where = query
      ? {
          OR: [
            {
              user: {
                email: { contains: query, mode: 'insensitive' as const },
              },
            },
            {
              user: {
                name: { contains: query, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : undefined

    const [total, subscriptions] = await Promise.all([
      prisma.appSubscription.count({ where }),
      prisma.appSubscription.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
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
      total,
      page,
      pageSize,
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
    })
  } catch (error) {
    console.error('Admin subscriptions load error:', error)
    return NextResponse.json(
      { error: 'Failed to load subscriptions.' },
      { status: 500 }
    )
  }
}
