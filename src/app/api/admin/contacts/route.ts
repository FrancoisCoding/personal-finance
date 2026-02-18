import { NextRequest, NextResponse } from 'next/server'
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

    const contacts = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 250,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
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
