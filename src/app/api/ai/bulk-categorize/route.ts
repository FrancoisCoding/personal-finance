import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { autoCategorizeTransactions } from '@/lib/enhanced-ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { transactionIds } = await request.json()

    if (!transactionIds || !Array.isArray(transactionIds)) {
      return NextResponse.json(
        { error: 'Invalid transaction IDs' },
        { status: 400 }
      )
    }

    // Get uncategorized transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: session.user.id,
        OR: [{ category: null }, { category: 'Other' }],
      },
      select: {
        id: true,
        description: true,
        amount: true,
        category: true,
      },
    })

    if (transactions.length === 0) {
      return NextResponse.json({
        message: 'No uncategorized transactions found',
      })
    }

    // Auto-categorize transactions
    const categorizationResults = await autoCategorizeTransactions(transactions)

    // Update transactions with suggested categories
    const updatePromises = categorizationResults.map((result) =>
      prisma.transaction.update({
        where: { id: result.transactionId },
        data: {
          category: result.suggestedCategory,
        },
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({
      message: `Successfully categorized ${categorizationResults.length} transactions`,
      results: categorizationResults,
    })
  } catch (error) {
    console.error('Bulk categorization error:', error)
    return NextResponse.json(
      { error: 'Failed to categorize transactions' },
      { status: 500 }
    )
  }
}
