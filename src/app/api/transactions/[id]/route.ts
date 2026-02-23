import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { TransactionType } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserCacheKey, invalidateCacheKey } from '@/lib/server-cache'
import { revalidateUserDataCacheTags } from '@/lib/data-cache'
import { isDemoModeRequest } from '@/lib/demo-mode'

interface IRouteContext {
  params: Promise<{ id: string }>
}

const ALLOWED_TRANSACTION_TYPES: TransactionType[] = [
  'INCOME',
  'EXPENSE',
  'TRANSFER',
]

function parseTransactionType(value: unknown): TransactionType | undefined {
  if (typeof value !== 'string') return undefined
  const upper = value.toUpperCase()
  return ALLOWED_TRANSACTION_TYPES.includes(upper as TransactionType)
    ? (upper as TransactionType)
    : undefined
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

    const body = await request.json().catch(() => ({}))
    if (body === null || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Allowlist: only these fields may be updated. Never pass userId, accountId, id, etc.
    const data: {
      description?: string
      amount?: number
      date?: Date
      type?: TransactionType
      categoryId?: string | null
      notes?: string | null
      isRecurring?: boolean
      tags?: string[]
    } = {}

    if (typeof body.description === 'string') {
      data.description = body.description.trim()
    }
    if (typeof body.amount === 'number' && Number.isFinite(body.amount)) {
      data.amount = body.amount
    } else if (typeof body.amount === 'string') {
      const parsed = Number.parseFloat(body.amount)
      if (Number.isFinite(parsed)) data.amount = parsed
    }
    if (typeof body.date === 'string') {
      const date = new Date(body.date)
      if (!Number.isNaN(date.getTime())) data.date = date
    }
    const parsedType = parseTransactionType(body.type)
    if (parsedType) data.type = parsedType
    if (body.notes !== undefined) {
      data.notes =
        typeof body.notes === 'string' ? body.notes.trim() || null : null
    }
    if (typeof body.isRecurring === 'boolean') {
      data.isRecurring = body.isRecurring
    }
    if (
      Array.isArray(body.tags) &&
      body.tags.every((t: unknown) => typeof t === 'string')
    ) {
      data.tags = body.tags
    }

    let categoryId: string | null | undefined = body.categoryId
    if (body.category && !categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          name: String(body.category),
          userId: session.user.id,
        },
      })
      categoryId = category?.id ?? null
    }
    if (categoryId !== undefined) {
      data.categoryId = categoryId === '' ? null : categoryId
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const updatedTransaction = await prisma.transaction.update({
      where: {
        id,
        userId: session.user.id,
      },
      data,
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
