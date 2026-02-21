import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserCacheKey, invalidateCacheKey } from '@/lib/server-cache'
import { revalidateUserDataCacheTags } from '@/lib/data-cache'
import { isDemoModeRequest } from '@/lib/demo-mode'

interface IRouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: IRouteContext) {
  try {
    const { id } = await context.params

    if (isDemoModeRequest(request)) {
      const updates = await request.json().catch(() => ({}))
      return NextResponse.json({
        id,
        ...updates,
      })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    // Find the category by name if categoryId is not provided
    let categoryId = updates.categoryId
    if (updates.category && !categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          name: updates.category,
          userId: session.user.id,
        },
      })
      categoryId = category?.id
    }

    const updatedTransaction = await prisma.transaction.update({
      where: {
        id: id,
        userId: session.user.id,
      },
      data: {
        ...updates,
        categoryId: categoryId,
      },
      include: {
        categoryRelation: true,
        account: true,
      },
    })

    invalidateCacheKey(getUserCacheKey('transactions', session.user.id))
    revalidateUserDataCacheTags(session.user.id, ['transactions'])

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}
