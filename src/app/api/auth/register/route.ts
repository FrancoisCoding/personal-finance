import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/password'
import { isCompromisedPassword } from '@/lib/compromised-password'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const parseString = (value: unknown) => {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const name = parseString(body?.name)
    const email = parseString(body?.email).toLowerCase()
    const password = parseString(body?.password)

    if (name.length < 2 || name.length > 120) {
      return NextResponse.json(
        { error: 'Please enter your full name.' },
        { status: 400 }
      )
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: 'Password must be between 8 and 128 characters.' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        hashedPassword: true,
      },
    })

    if (existingUser?.id) {
      return NextResponse.json(
        {
          error: existingUser.hashedPassword
            ? 'An account with this email already exists.'
            : 'This email is linked to a different sign-in method.',
        },
        { status: 409 }
      )
    }

    const isCompromised = await isCompromisedPassword(password)
    if (isCompromised) {
      return NextResponse.json(
        {
          error:
            'This password has appeared in known data breaches. Choose a different password.',
        },
        { status: 400 }
      )
    }

    const hashedPassword = hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json(
      {
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}
