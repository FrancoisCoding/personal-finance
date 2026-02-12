import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { seedCategories } from '@/lib/seed-categories'
import { getUserCacheKey, invalidateCacheKey } from '@/lib/server-cache'

export async function POST() {
  try {
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
