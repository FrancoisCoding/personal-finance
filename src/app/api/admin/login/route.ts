import { NextRequest, NextResponse } from 'next/server'
import {
  adminSessionCookieName,
  createAdminSessionToken,
  hasAdminCredentialsConfigured,
  isValidAdminLogin,
} from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
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
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 12,
      }
    )
    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Admin login failed.' }, { status: 500 })
  }
}
