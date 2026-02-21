import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { categorizeTransaction } from '@/lib/local-ai'
import { isDemoModeRequest } from '@/lib/demo-mode'
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

    const rateLimit = await enforceRateLimit({
      request,
      scope: 'ai-categorize',
      userId: session.user.id,
      maxRequests: 240,
      windowMs: 60_000,
    })
    if (rateLimit.isLimited) {
      return createRateLimitResponse(rateLimit)
    }

    const body = await request.json().catch(() => ({}))
    const description =
      typeof body?.description === 'string' ? body.description.trim() : ''
    const amount =
      typeof body?.amount === 'number' && Number.isFinite(body.amount)
        ? body.amount
        : null

    if (!description || description.length > 512 || amount === null) {
      return NextResponse.json(
        {
          error:
            'Description and amount are required with a valid description length.',
        },
        { status: 400 }
      )
    }

    const result = await categorizeTransaction(description, amount)

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI categorization error:', error)
    return NextResponse.json(
      { error: 'Failed to categorize transaction' },
      { status: 500 }
    )
  }
}
