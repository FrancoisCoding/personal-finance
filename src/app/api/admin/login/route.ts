import { NextRequest, NextResponse } from 'next/server'
import {
  adminSessionCookieOptions,
  adminSessionCookieName,
  createAdminSessionToken,
  hasAdminCredentialsConfigured,
  isSameOriginAdminRequest,
  isValidAdminLogin,
} from '@/lib/admin-auth'
import {
  createRateLimitResponse,
  enforceRateLimit,
} from '@/lib/request-rate-limit'

export async function POST(request: NextRequest) {
  try {
    if (!isSameOriginAdminRequest(request)) {
      return NextResponse.json(
        { error: 'Blocked by origin policy.' },
        { status: 403 }
      )
    }

    const rateLimit = await enforceRateLimit({
      request,
      scope: 'admin-login',
      maxRequests: 6,
      windowMs: 60_000,
    })
    if (rateLimit.isLimited) {
      return createRateLimitResponse(
        rateLimit,
        'Too many admin login attempts. Please wait and try again.'
      )
    }

    if (!hasAdminCredentialsConfigured()) {
      return NextResponse.json(
        { error: 'Admin credentials are not configured.' },
        { status: 500 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const password =
      typeof body?.password === 'string' ? body.password.trim() : ''

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    if (!isValidAdminLogin(email, password)) {
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(
      adminSessionCookieName,
      createAdminSessionToken(email),
      {
        ...adminSessionCookieOptions,
      }
    )
    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Admin login failed.' }, { status: 500 })
  }
}
