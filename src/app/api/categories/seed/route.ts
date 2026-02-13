import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { seedCategories } from '@/lib/seed-categories'
import { getUserCacheKey, invalidateCacheKey } from '@/lib/server-cache'
import { buildDemoData } from '@/lib/demo-data'
import { isDemoModeRequest } from '@/lib/demo-mode'

export async function POST(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json({
        message: 'Demo categories seeded successfully',
        categories: buildDemoData().categories,
      })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await seedCategories(session.user.id)

    invalidateCacheKey(getUserCacheKey('categories', session.user.id))

    return NextResponse.json({
      message: 'Categories seeded successfully',
      categories,
    })
  } catch (error) {
    console.error('Error seeding categories:', error)
    return NextResponse.json(
      { error: 'Failed to seed categories' },
      { status: 500 }
    )
  }
}
