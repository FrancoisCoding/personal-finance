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

const CATEGORIES_CACHE_TTL_MS = 30_000

export async function GET(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json(buildDemoData().categories)
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = getUserCacheKey('categories', session.user.id)
    const cachedCategories =
      getCachedValue<Awaited<ReturnType<typeof prisma.category.findMany>>>(
        cacheKey
      )
    if (cachedCategories) {
      return NextResponse.json(cachedCategories)
    }

    const categories = await prisma.category.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        name: 'asc',
      },
    })

    setCachedValue(cacheKey, categories, CATEGORIES_CACHE_TTL_MS)

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      const body = await request.json().catch(() => ({}))
      const category = {
        id: `demo-category-${Date.now()}`,
        userId: 'demo-user',
        name: body?.name ?? 'Demo category',
        color: body?.color ?? '#10B981',
        icon: body?.icon ?? 'Tag',
      }
      return NextResponse.json(category)
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, color, icon } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const category = await prisma.category.create({
      data: {
        name,
        color: color || '#10B981',
        icon: icon || 'Tag',
        userId: session.user.id,
      },
    })

    invalidateCacheKey(getUserCacheKey('categories', session.user.id))

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
