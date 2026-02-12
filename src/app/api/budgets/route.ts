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

const BUDGETS_CACHE_TTL_MS = 30_000

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = getUserCacheKey('budgets', session.user.id)
    const cachedBudgets =
      getCachedValue<Awaited<ReturnType<typeof prisma.budget.findMany>>>(
        cacheKey
      )
    if (cachedBudgets) {
      return NextResponse.json(cachedBudgets)
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    setCachedValue(cacheKey, budgets, BUDGETS_CACHE_TTL_MS)

    return NextResponse.json(budgets)
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      categoryId,
      amount,
      period,
      startDate,
      endDate,
      isRecurring,
    } = body

    if (!name || !amount || !period || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const budget = await prisma.budget.create({
      data: {
        userId: session.user.id,
        name,
        categoryId: categoryId || null,
        amount: parseFloat(amount),
        period,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isActive: true,
        isRecurring: isRecurring || false,
      },
      include: {
        category: true,
      },
    })

    invalidateCacheKey(getUserCacheKey('budgets', session.user.id))

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    )
  }
}
