import { NextRequest, NextResponse } from 'next/server'
import {
  adminSessionCookieName,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

const unauthorizedResponse = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const escapeCsvValue = (value: string) => {
  const normalizedValue =
    /^[=+\-@]/.test(value) || value.startsWith('\t') ? `'${value}` : value
  const escaped = normalizedValue.replace(/\"/g, '""')
  return `"${escaped}"`
}

const buildCsv = (headers: string[], rows: string[][]) => {
  const headerLine = headers.map(escapeCsvValue).join(',')
  const rowLines = rows.map((row) => row.map(escapeCsvValue).join(','))
  return [headerLine, ...rowLines].join('\n')
}

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get(adminSessionCookieName)?.value
    if (!verifyAdminSessionToken(adminToken)) {
      return unauthorizedResponse()
    }

    const type = request.nextUrl.searchParams.get('type')?.trim() ?? ''
    const query = request.nextUrl.searchParams.get('q')?.trim() ?? ''

    const maxRows = 5000
    const nowValue = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')

    if (type === 'contacts') {
      const where = query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { email: { contains: query, mode: 'insensitive' as const } },
              { subject: { contains: query, mode: 'insensitive' as const } },
              { message: { contains: query, mode: 'insensitive' as const } },
            ],
          }
        : undefined

      const contacts = await prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: maxRows,
      })

      const csv = buildCsv(
        ['id', 'name', 'email', 'subject', 'message', 'createdAt'],
        contacts.map((contact) => [
          contact.id,
          contact.name,
          contact.email,
          contact.subject,
          contact.message,
          contact.createdAt.toISOString(),
        ])
      )

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="contacts-${nowValue}.csv"`,
        },
      })
    }

    if (type === 'subscriptions') {
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

      const subscriptions = await prisma.appSubscription.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take: maxRows,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      })

      const csv = buildCsv(
        [
          'id',
          'userEmail',
          'userName',
          'plan',
          'status',
          'trialEndsAt',
          'currentPeriodEnd',
          'cancelAtPeriodEnd',
          'stripeCustomerId',
          'stripeSubscriptionId',
          'updatedAt',
        ],
        subscriptions.map((subscription) => [
          subscription.id,
          subscription.user.email,
          subscription.user.name ?? '',
          subscription.plan,
          subscription.status,
          subscription.trialEndsAt?.toISOString() ?? '',
          subscription.currentPeriodEnd?.toISOString() ?? '',
          subscription.cancelAtPeriodEnd ? 'true' : 'false',
          subscription.stripeCustomerId ?? '',
          subscription.stripeSubscriptionId ?? '',
          subscription.updatedAt.toISOString(),
        ])
      )

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="subscriptions-${nowValue}.csv"`,
        },
      })
    }

    if (type === 'sessions') {
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

      const sessions = await prisma.accessSession.findMany({
        where,
        orderBy: { lastActiveAt: 'desc' },
        take: maxRows,
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      })

      const csv = buildCsv(
        [
          'id',
          'userEmail',
          'userName',
          'name',
          'location',
          'isTrusted',
          'lastActiveAt',
        ],
        sessions.map((session) => [
          session.id,
          session.user.email,
          session.user.name ?? '',
          session.name,
          session.location,
          session.isTrusted ? 'true' : 'false',
          session.lastActiveAt.toISOString(),
        ])
      )

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="sessions-${nowValue}.csv"`,
        },
      })
    }

    return NextResponse.json(
      { error: 'Unsupported export type.' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Admin export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data.' },
      { status: 500 }
    )
  }
}
