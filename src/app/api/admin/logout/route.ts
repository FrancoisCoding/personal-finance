import { NextRequest, NextResponse } from 'next/server'
import {
  adminSessionCookieName,
  adminSessionCookieOptions,
  isSameOriginAdminRequest,
} from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  if (!isSameOriginAdminRequest(request)) {
    return NextResponse.json(
      { error: 'Blocked by origin policy.' },
      { status: 403 }
    )
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(adminSessionCookieName, '', {
    ...adminSessionCookieOptions,
    maxAge: 0,
  })
  return response
}
