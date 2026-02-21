import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createRateLimitResponse,
  enforceRateLimit,
} from '@/lib/request-rate-limit'
import {
  createPasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken,
} from '@/lib/password-reset'
import { sendPasswordResetEmail } from '@/lib/transactional-email'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeEmail = (value: unknown) => {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

const resolveApplicationOrigin = (request: NextRequest) => {
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (publicAppUrl) {
    try {
      return new URL(publicAppUrl).origin
    } catch {
      console.warn(
        'NEXT_PUBLIC_APP_URL is invalid. Falling back to request origin.'
      )
    }
  }

  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim()
  if (nextAuthUrl) {
    try {
      return new URL(nextAuthUrl).origin
    } catch {
      console.warn('NEXTAUTH_URL is invalid. Falling back to request origin.')
    }
  }

  return request.nextUrl.origin
}

const successResponse = () => {
  return NextResponse.json({
    success: true,
    message:
      'If an account exists for that email, a password reset link has been sent.',
  })
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = await enforceRateLimit({
      request,
      scope: 'auth-forgot-password',
      maxRequests: 5,
      windowMs: 5 * 60_000,
    })
    if (rateLimit.isLimited) {
      return createRateLimitResponse(
        rateLimit,
        'Too many password reset attempts. Please wait and try again.'
      )
    }

    const body = await request.json().catch(() => ({}))
    const email = normalizeEmail(body?.email)

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (!user) {
      return successResponse()
    }

    const resetToken = createPasswordResetToken()
    const tokenHash = hashPasswordResetToken(resetToken)
    const expiresAt = getPasswordResetExpiry(60)

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    })

    const baseOrigin = resolveApplicationOrigin(request)
    const resetUrl = `${baseOrigin}/auth/reset-password?token=${encodeURIComponent(resetToken)}`

    await sendPasswordResetEmail({
      toEmail: user.email,
      recipientName: user.name,
      resetUrl,
    })

    return successResponse()
  } catch (error) {
    console.error('Forgot password error:', error)
    return successResponse()
  }
}
