import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { chatWithAI } from '@/lib/local-ai'
import { buildDemoData } from '@/lib/demo-data'
import { isDemoModeRequest } from '@/lib/demo-mode'
import { getUserEntitlements } from '@/lib/user-entitlements'
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
          error: isDemoMode
            ? 'Sign in is required to use demo AI features.'
            : 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const rateLimit = enforceRateLimit({
      request,
      scope: 'ai-chat',
      userId: session.user.id,
      maxRequests: 20,
      windowMs: 60_000,
    })
    if (rateLimit.isLimited) {
      return createRateLimitResponse(rateLimit)
    }

    if (!isDemoMode) {
      const { hasProAccess } = await getUserEntitlements(session.user.id)

      if (!hasProAccess) {
        return NextResponse.json(
          { error: 'Pro plan required for Financial Assistant access.' },
          { status: 403 }
        )
      }
    }

    const body = await request.json().catch(() => ({}))
    const message = typeof body?.message === 'string' ? body.message.trim() : ''
    const context = body?.context

    if (!message || message.length > 4000) {
      return NextResponse.json(
        { error: 'Message must be between 1 and 4000 characters.' },
        { status: 400 }
      )
    }

    if (isDemoMode) {
      const demoData = buildDemoData()
      const demoContext = {
        generatedAt: new Date().toISOString(),
        transactions:
          context?.transactions?.length > 0
            ? context.transactions
            : demoData.transactions,
        accounts:
          context?.accounts?.length > 0 ? context.accounts : demoData.accounts,
        subscriptions:
          context?.subscriptions?.length > 0
            ? context.subscriptions
            : demoData.subscriptions,
      }
      const response = await chatWithAI(message, demoContext)
      return NextResponse.json({ response })
    }

    const response = await chatWithAI(message, context || {})

    return NextResponse.json({ response })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
}
