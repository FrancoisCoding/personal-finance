import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const parseString = (value: unknown) => {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const name = parseString(body?.name)
    const email = parseString(body?.email)
    const subject = parseString(body?.subject)
    const message = parseString(body?.message)

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        { error: 'Please enter a valid name.' },
        { status: 400 }
      )
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    if (subject.length < 4 || subject.length > 120) {
      return NextResponse.json(
        { error: 'Please enter a subject between 4 and 120 characters.' },
        { status: 400 }
      )
    }

    if (message.length < 10 || message.length > 2000) {
      return NextResponse.json(
        { error: 'Please enter a message between 10 and 2000 characters.' },
        { status: 400 }
      )
    }

    const session = await getServerSession(authOptions)

    await prisma.contactSubmission.create({
      data: {
        userId: session?.user?.id ?? null,
        name,
        email: email.toLowerCase(),
        subject,
        message,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message:
          'Thanks for reaching out. We received your message and will reply soon.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating contact submission:', error)
    return NextResponse.json(
      { error: 'Unable to submit your message right now.' },
      { status: 500 }
    )
  }
}
