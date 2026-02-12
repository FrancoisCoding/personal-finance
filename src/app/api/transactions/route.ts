import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getCachedValue,
  getUserCacheKey,
  invalidateCacheKeys,
  setCachedValue,
} from '@/lib/server-cache'

const TRANSACTIONS_CACHE_TTL_MS = 30_000

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = getUserCacheKey('transactions', session.user.id)
    const cachedTransactions =
      getCachedValue<Awaited<ReturnType<typeof prisma.transaction.findMany>>>(
        cacheKey
      )
    if (cachedTransactions) {
      return NextResponse.json(cachedTransactions)
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        account: true,
        categoryRelation: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    setCachedValue(cacheKey, transactions, TRANSACTIONS_CACHE_TTL_MS)

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
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
      accountId,
      categoryId,
      amount,
      description,
      date,
      type,
      isRecurring,
      tags,
      notes,
    } = body

    if (!accountId || !amount || !description || !date || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify the account belongs to the user
    const account = await prisma.financialAccount.findFirst({
      where: {
        id: accountId,
        userId: session.user.id,
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or unauthorized' },
        { status: 404 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        accountId,
        categoryId: categoryId || null,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        type,
        isRecurring: isRecurring || false,
        tags: tags || [],
        notes: notes || null,
      },
      include: {
        account: true,
        categoryRelation: true,
      },
    })

    // Update account balance
    const balanceChange = type === 'INCOME' ? amount : -amount
    await prisma.financialAccount.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    })

    invalidateCacheKeys([
      getUserCacheKey('transactions', session.user.id),
      getUserCacheKey('accounts', session.user.id),
    ])

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
