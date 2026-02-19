import { NextRequest, NextResponse } from 'next/server'
import {
  adminSessionCookieName,
  isSameOriginAdminRequest,
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
            { name: { contains: query, mode: 'insensitive' as const } },
            { email: { contains: query, mode: 'insensitive' as const } },
            { subject: { contains: query, mode: 'insensitive' as const } },
            { message: { contains: query, mode: 'insensitive' as const } },
          ],
        }
      : undefined

    const [total, contacts] = await Promise.all([
      prisma.contactSubmission.count({ where }),
      prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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
      contacts: contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        createdAt: contact.createdAt.toISOString(),
        user: contact.user,
      })),
    })
  } catch (error) {
    console.error('Admin contacts load error:', error)
    return NextResponse.json(
      { error: 'Failed to load contact submissions.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!isSameOriginAdminRequest(request)) {
      return NextResponse.json(
        { error: 'Blocked by origin policy.' },
        { status: 403 }
      )
    }

    const adminToken = request.cookies.get(adminSessionCookieName)?.value
    if (!verifyAdminSessionToken(adminToken)) {
      return unauthorizedResponse()
    }

    const body = await request.json().catch(() => ({}))
    const contactId = typeof body?.id === 'string' ? body.id.trim() : ''
    if (!contactId) {
      return NextResponse.json(
        { error: 'Missing contact id.' },
        { status: 400 }
      )
    }

    await prisma.contactSubmission.delete({
      where: { id: contactId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin contact delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact submission.' },
      { status: 500 }
    )
  }
}
