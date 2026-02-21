import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { seedCategories } from '@/lib/seed-categories'
import { autoCategorizeTransactions } from '@/lib/enhanced-ai'
import { revalidateUserDataCacheTags } from '@/lib/data-cache'
import { buildDemoData } from '@/lib/demo-data'
import { isDemoModeRequest } from '@/lib/demo-mode'
import {
  createRateLimitResponse,
  enforceRateLimit,
} from '@/lib/request-rate-limit'

export async function POST(request: NextRequest) {
  try {
    const isDemoMode = isDemoModeRequest(request)
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: isDemoMode
            ? 'Sign in is required to use demo AI features.'
            : 'Unauthorized',
        },
        { status: 401 }
      )
    }

    const rateLimit = await enforceRateLimit({
      request,
      scope: 'ai-bulk-categorize',
      userId: session.user.id,
      maxRequests: 90,
      windowMs: 60_000,
    })
    if (rateLimit.isLimited) {
      return createRateLimitResponse(rateLimit)
    }

    const body = await request.json().catch(() => ({}))
    const parsedTransactionIds: unknown[] = Array.isArray(body?.transactionIds)
      ? body.transactionIds
      : []
    const transactionIds = parsedTransactionIds
      .filter((id): id is string => typeof id === 'string')
      .map((id) => id.trim())
      .filter(Boolean)

    if (
      transactionIds.length === 0 ||
      transactionIds.length > 500 ||
      transactionIds.length !== parsedTransactionIds.length
    ) {
      return NextResponse.json(
        { error: 'Invalid transaction IDs' },
        { status: 400 }
      )
    }

    if (isDemoMode) {
      const demoTransactions = buildDemoData().transactions.filter(
        (transaction) => transactionIds.includes(transaction.id)
      )

      if (demoTransactions.length === 0) {
        return NextResponse.json({
          message: 'No uncategorized transactions found',
        })
      }
      const categorizationResults = await autoCategorizeTransactions(
        demoTransactions.map((transaction) => ({
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category ?? null,
        }))
      )

      return NextResponse.json({
        message: `Successfully categorized ${categorizationResults.length} transactions`,
        results: categorizationResults,
      })
    }

    let categories = await prisma.category.findMany({
      where: {
        OR: [{ userId: session.user.id }, { userId: null }],
      },
      select: {
        id: true,
        name: true,
      },
    })
    if (categories.length === 0) {
      categories = await seedCategories(session.user.id)
    }
    const categoryIdByName = new Map(
      categories.map((category) => [
        category.name.trim().toLowerCase(),
        category.id,
      ])
    )

    // Get uncategorized transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: session.user.id,
        OR: [
          { categoryId: null },
          { category: null },
          { category: 'Other' },
          { category: 'Uncategorized' },
        ],
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
    const updatePromises = categorizationResults.map((result) => {
      const normalizedCategory = result.suggestedCategory.trim().toLowerCase()
      const matchedCategoryId = categoryIdByName.get(normalizedCategory)

      return prisma.transaction.update({
        where: { id: result.transactionId },
        data: {
          category: result.suggestedCategory,
          categoryId: matchedCategoryId,
        },
      })
    })

    await Promise.all(updatePromises)
    revalidateUserDataCacheTags(session.user.id, ['transactions'])

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
