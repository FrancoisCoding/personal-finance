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
            { location: { contains: query, mode: 'insensitive' as const } },
            { name: { contains: query, mode: 'insensitive' as const } },
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

    const [total, sessions] = await Promise.all([
      prisma.accessSession.count({ where }),
      prisma.accessSession.findMany({
        where,
        orderBy: { lastActiveAt: 'desc' },
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
      sessions: sessions.map((session) => ({
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
    console.error('Admin sessions load error:', error)
    return NextResponse.json(
      { error: 'Failed to load sessions.' },
      { status: 500 }
    )
  }
}
