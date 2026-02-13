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

const GOALS_CACHE_TTL_MS = 30_000

export async function GET(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json(buildDemoData().goals)
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = getUserCacheKey('goals', session.user.id)
    const cachedGoals =
      getCachedValue<Awaited<ReturnType<typeof prisma.goal.findMany>>>(cacheKey)
    if (cachedGoals) {
      return NextResponse.json(cachedGoals)
    }

    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    setCachedValue(cacheKey, goals, GOALS_CACHE_TTL_MS)

    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch goals' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      const body = await request.json().catch(() => ({}))
      const goal = {
        id: `demo-goal-${Date.now()}`,
        userId: 'demo-user',
        name: body?.name ?? 'Demo goal',
        description: body?.description ?? null,
        targetAmount: parseFloat(body?.targetAmount ?? 0),
        currentAmount: 0,
        targetDate: body?.targetDate ?? null,
        color: body?.color ?? '#3B82F6',
        icon: body?.icon ?? 'Target',
        isCompleted: false,
      }
      return NextResponse.json(goal, { status: 201 })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, targetAmount, targetDate, color, icon } = body

    if (!name || !targetAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        targetAmount: parseFloat(targetAmount),
        currentAmount: 0,
        targetDate: targetDate ? new Date(targetDate) : null,
        color: color || '#3B82F6',
        icon: icon || 'Target',
        isCompleted: false,
      },
    })

    invalidateCacheKey(getUserCacheKey('goals', session.user.id))

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error('Error creating goal:', error)
    return NextResponse.json(
      { error: 'Failed to create goal' },
      { status: 500 }
    )
  }
}
