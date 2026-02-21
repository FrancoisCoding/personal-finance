import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  getUserDataCacheTag,
  revalidateUserDataCacheTags,
} from '@/lib/data-cache'
import { buildDemoData } from '@/lib/demo-data'
import { isDemoModeRequest } from '@/lib/demo-mode'

const TRANSACTIONS_CACHE_TTL_SECONDS = 30

const getCachedTransactions = (userId: string) =>
  unstable_cache(
    async () => {
      return prisma.transaction.findMany({
        where: {
          userId,
        },
        include: {
          account: true,
          categoryRelation: true,
        },
        orderBy: {
          date: 'desc',
        },
      })
    },
    ['transactions', userId],
    {
      revalidate: TRANSACTIONS_CACHE_TTL_SECONDS,
      tags: [getUserDataCacheTag('transactions', userId)],
    }
  )()

export async function GET(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json(buildDemoData().transactions)
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transactions = await getCachedTransactions(session.user.id)

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
    if (isDemoModeRequest(request)) {
      const body = await request.json().catch(() => ({}))
      const transaction = {
        id: `demo-transaction-${Date.now()}`,
        userId: 'demo-user',
        accountId: body?.accountId ?? 'demo-checking',
        categoryId: body?.categoryId,
        category: body?.category,
        amount: parseFloat(body?.amount ?? 0),
        description: body?.description ?? 'Demo transaction',
        date: body?.date ?? new Date().toISOString(),
        type: body?.type ?? 'EXPENSE',
        isRecurring: body?.isRecurring ?? false,
        tags: body?.tags ?? [],
        notes: body?.notes ?? null,
      }
      return NextResponse.json(transaction, { status: 201 })
    }

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

    const numericAmount = parseFloat(amount)
    const balanceChange = type === 'INCOME' ? numericAmount : -numericAmount
    await prisma.financialAccount.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: balanceChange,
        },
      },
    })

    revalidateUserDataCacheTags(session.user.id, ['transactions', 'accounts'])

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
