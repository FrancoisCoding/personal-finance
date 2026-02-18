import { NextRequest, NextResponse } from 'next/server'
import { AppPlan, AppSubscriptionStatus } from '@prisma/client'
import {
  adminSessionCookieName,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { comparePlanPriority } from '@/lib/billing'

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const clampNumber = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

const parsePageValue = (value: string | null, fallback: number) => {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN
  return Number.isFinite(parsed) ? parsed : fallback
}

const resolveCurrentPlan = (
  isSuperUser: boolean,
  subscriptions: Array<{ plan: AppPlan; updatedAt: Date }>
) => {
  if (isSuperUser) {
    return AppPlan.PRO
  }

  if (subscriptions.length === 0) {
    return null
  }

  return subscriptions.slice().sort((left, right) => {
    const planPriorityDifference =
      comparePlanPriority(right.plan) - comparePlanPriority(left.plan)
    if (planPriorityDifference !== 0) {
      return planPriorityDifference
    }
    return right.updatedAt.getTime() - left.updatedAt.getTime()
  })[0].plan
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
            { email: { contains: query, mode: 'insensitive' as const } },
            { name: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : undefined

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (page - 1) * pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          isSuperUser: true,
          createdAt: true,
          emailVerified: true,
          appSubscriptions: {
            where: {
              status: {
                in: [
                  AppSubscriptionStatus.ACTIVE,
                  AppSubscriptionStatus.TRIALING,
                ],
              },
            },
            orderBy: { updatedAt: 'desc' },
            select: {
              plan: true,
              updatedAt: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      total,
      page,
      pageSize,
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isSuperUser: user.isSuperUser,
        createdAt: user.createdAt.toISOString(),
        emailVerified: user.emailVerified?.toISOString() ?? null,
        currentPlan: resolveCurrentPlan(
          user.isSuperUser,
          user.appSubscriptions
        ),
      })),
    })
  } catch (error) {
    console.error('Admin users load error:', error)
    return NextResponse.json(
      { error: 'Failed to load users.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminToken = request.cookies.get(adminSessionCookieName)?.value
    if (!verifyAdminSessionToken(adminToken)) {
      return unauthorizedResponse()
    }

    const body = await request.json().catch(() => ({}))
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : ''
    const isSuperUser =
      typeof body?.isSuperUser === 'boolean' ? body.isSuperUser : null

    if (!userId || isSuperUser === null) {
      return NextResponse.json(
        { error: 'Invalid superuser update payload.' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isSuperUser },
      select: {
        id: true,
        email: true,
        isSuperUser: true,
      },
    })

    return NextResponse.json({
      user: updatedUser,
    })
  } catch (error) {
    console.error('Admin superuser update error:', error)
    return NextResponse.json(
      { error: 'Failed to update superuser access.' },
      { status: 500 }
    )
  }
}
