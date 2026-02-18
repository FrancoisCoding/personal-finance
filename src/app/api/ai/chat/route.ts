import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { AppPlan } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { chatWithAI } from '@/lib/local-ai'
import { buildDemoData } from '@/lib/demo-data'
import { isDemoModeRequest } from '@/lib/demo-mode'
import {
  comparePlanPriority,
  getEffectivePlanFromSubscriptions,
} from '@/lib/billing'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const isDemoMode = isDemoModeRequest(request)
    if (!isDemoMode) {
      const session = await getServerSession(authOptions)
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const subscriptions = await prisma.appSubscription.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
      })
      const effectiveSubscription =
        getEffectivePlanFromSubscriptions(subscriptions)
      const hasProAccess =
        effectiveSubscription &&
        comparePlanPriority(effectiveSubscription.plan) >=
          comparePlanPriority(AppPlan.PRO)

      if (!hasProAccess) {
        return NextResponse.json(
          { error: 'Pro plan required for Financial Assistant access.' },
          { status: 403 }
        )
      }
    }

    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
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
