import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getCachedValue,
  getUserCacheKey,
  invalidateCacheKey,
  setCachedValue,
} from '@/lib/server-cache'
import { buildDemoData } from '@/lib/demo-data'
import { isDemoModeRequest } from '@/lib/demo-mode'

const SUBSCRIPTIONS_CACHE_TTL_MS = 30_000

export async function GET(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json(buildDemoData().subscriptions)
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = getUserCacheKey('subscriptions', session.user.id)
    const cachedSubscriptions =
      getCachedValue<Awaited<ReturnType<typeof prisma.subscription.findMany>>>(
        cacheKey
      )
    if (cachedSubscriptions) {
      return NextResponse.json(cachedSubscriptions)
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        category: true,
      },
      orderBy: {
        nextBillingDate: 'asc',
      },
    })

    setCachedValue(cacheKey, subscriptions, SUBSCRIPTIONS_CACHE_TTL_MS)

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      const body = await request.json().catch(() => ({}))
      const subscription = {
        id: `demo-subscription-${Date.now()}`,
        userId: 'demo-user',
        name: body?.name ?? 'Demo subscription',
        amount: parseFloat(body?.amount ?? 0),
        currency: 'USD',
        billingCycle: body?.billingCycle ?? 'MONTHLY',
        nextBillingDate: body?.nextBillingDate ?? new Date().toISOString(),
        categoryId: body?.categoryId ?? null,
        isActive: true,
        notes: body?.notes ?? null,
      }
      return NextResponse.json(subscription, { status: 201 })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, amount, billingCycle, nextBillingDate, categoryId, notes } =
      body

    if (!name || !amount || !billingCycle || !nextBillingDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const subscription = await prisma.subscription.create({
      data: {
        name,
        amount: parseFloat(amount),
        billingCycle,
        nextBillingDate: new Date(nextBillingDate),
        categoryId: categoryId || null,
        notes: notes || null,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    })

    invalidateCacheKey(getUserCacheKey('subscriptions', session.user.id))

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
