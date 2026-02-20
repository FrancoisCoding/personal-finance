import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { chatWithAI } from '@/lib/local-ai'
import { isDemoModeRequest } from '@/lib/demo-mode'
import { getUserEntitlements } from '@/lib/user-entitlements'
import { getAiChatRateLimitPolicy } from '@/lib/ai-chat-rate-limits'
import {
  createRateLimitResponse,
  enforceRateLimit,
} from '@/lib/request-rate-limit'

export async function POST(request: NextRequest) {
  try {
    const isDemoMode = isDemoModeRequest(request)
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    if (isDemoMode) {
      return NextResponse.json(
        {
          error:
            'AI Assistant is unavailable in Starter/demo mode. Upgrade to Basic or Pro.',
        },
        { status: 403 }
      )
    }

    let userTier: 'BASIC' | 'PRO' | null = null

    const { currentPlan } = await getUserEntitlements(session.user.id)
    userTier =
      currentPlan === 'PRO' || currentPlan === 'BASIC' ? currentPlan : null

    if (!userTier) {
      return NextResponse.json(
        { error: 'A paid Basic or Pro subscription is required.' },
        { status: 403 }
      )
    }

    const rateLimitPolicy = getAiChatRateLimitPolicy({
      isDemoMode,
      tier: userTier,
    })

    const burstRateLimit = enforceRateLimit({
      request,
      scope: `${rateLimitPolicy.scope}:burst`,
      userId: session.user.id,
      maxRequests: rateLimitPolicy.policy.burstMaxRequests,
      windowMs: rateLimitPolicy.policy.burstWindowMs,
    })
    if (burstRateLimit.isLimited) {
      return createRateLimitResponse(
        burstRateLimit,
        'Too many chat requests in a short period. Please retry shortly.'
      )
    }

    const windowRateLimit = enforceRateLimit({
      request,
      scope: `${rateLimitPolicy.scope}:window`,
      userId: session.user.id,
      maxRequests: rateLimitPolicy.policy.windowMaxRequests,
      windowMs: rateLimitPolicy.policy.windowMs,
    })
    if (windowRateLimit.isLimited) {
      return createRateLimitResponse(
        windowRateLimit,
        userTier === 'BASIC'
          ? 'Basic AI message window reached. Please wait for reset and try again.'
          : 'AI fair-use window reached. Please wait for reset and retry.'
      )
    }

    const dailyRateLimit = enforceRateLimit({
      request,
      scope: `${rateLimitPolicy.scope}:daily`,
      userId: session.user.id,
      maxRequests: rateLimitPolicy.policy.dailyMaxRequests,
      windowMs: rateLimitPolicy.policy.dailyWindowMs,
    })
    if (dailyRateLimit.isLimited) {
      return createRateLimitResponse(
        dailyRateLimit,
        userTier === 'BASIC'
          ? 'Basic daily AI limit reached. Please try again after reset.'
          : 'Daily AI fair-use safeguard reached. Please try again after reset.'
      )
    }

    const body = await request.json().catch(() => ({}))
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const context = body?.context
    const locale = typeof body?.locale === 'string' ? body.locale.trim() : ''
    const currency =
      typeof body?.currency === 'string'
        ? body.currency.trim().toUpperCase()
        : ''

    if (!message || message.length > 4000) {
      return NextResponse.json(
        { error: 'Message must be between 1 and 4000 characters.' },
        { status: 400 }
      )
    }

    const normalizedLocale = /^[a-z]{2}-[A-Z]{2}$/.test(locale)
      ? locale
      : 'en-US'
    const normalizedCurrency = /^[A-Z]{3}$/.test(currency) ? currency : 'USD'

    const response = await chatWithAI(message, {
      ...(context || {}),
      locale: normalizedLocale,
      currency: normalizedCurrency,
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
