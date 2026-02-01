import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
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

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}
