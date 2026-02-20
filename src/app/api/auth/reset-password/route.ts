import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createRateLimitResponse,
  enforceRateLimit,
} from '@/lib/request-rate-limit'
import { hashPassword } from '@/lib/password'
import { hashPasswordResetToken } from '@/lib/password-reset'
import { getPasswordPolicyErrors } from '@/lib/password-policy'

const parseString = (value: unknown) => {
  return typeof value === 'string' ? value.trim() : ''
}

const getActiveResetTokenByHash = async (tokenHash: string) => {
  return prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  })
}

const isTokenRecordActive = (tokenRecord: {
  expiresAt: Date
  usedAt: Date | null
}) => {
  if (tokenRecord.usedAt) {
    return false
  }
  return tokenRecord.expiresAt.getTime() > Date.now()
}

export async function GET(request: NextRequest) {
  try {
    const token = parseString(request.nextUrl.searchParams.get('token'))
    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const tokenHash = hashPasswordResetToken(token)
    const tokenRecord = await getActiveResetTokenByHash(tokenHash)

    if (!tokenRecord || !isTokenRecordActive(tokenRecord)) {
      return NextResponse.json({ valid: false })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Reset token validation error:', error)
    return NextResponse.json({ valid: false })
  }
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = enforceRateLimit({
      request,
      scope: 'auth-reset-password',
      maxRequests: 12,
      windowMs: 10 * 60_000,
    })
    if (rateLimit.isLimited) {
      return createRateLimitResponse(
        rateLimit,
        'Too many reset attempts. Please wait and try again.'
      )
    }

    const body = await request.json().catch(() => ({}))
    const token = parseString(body?.token)
    const password = parseString(body?.password)

    if (!token) {
      return NextResponse.json(
        { error: 'Password reset token is required.' },
        { status: 400 }
      )
    }

    const passwordPolicyErrors = getPasswordPolicyErrors(password)
    if (passwordPolicyErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'Password does not meet security requirements.',
          details: passwordPolicyErrors,
        },
        { status: 400 }
      )
    }

    const tokenHash = hashPasswordResetToken(token)
    const tokenRecord = await getActiveResetTokenByHash(tokenHash)

    if (!tokenRecord || !isTokenRecordActive(tokenRecord)) {
      return NextResponse.json(
        { error: 'This password reset link is invalid or has expired.' },
        { status: 400 }
      )
    }

    const hashedPassword = hashPassword(password)
    const now = new Date()

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: now },
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: tokenRecord.userId,
          id: { not: tokenRecord.id },
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Unable to reset password right now.' },
      { status: 500 }
    )
  }
}
