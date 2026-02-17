import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getCachedValue,
  getUserCacheKey,
  invalidateCacheKey,
  setCachedValue,
} from '@/lib/server-cache'
import { buildDemoData } from '@/lib/demo-data'
import { isDemoModeRequest } from '@/lib/demo-mode'
import { prisma } from '@/lib/prisma'
import { AccountType } from '@prisma/client'

const CREDIT_CARDS_CACHE_TTL_MS = 30_000

type CreditCardSummary = {
  id: string
  name: string
  balance: number
  limit: number
  apr: number
  dueDate: string
  lastStatement: string
}

export async function GET(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json(buildDemoData().creditCards)
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = getUserCacheKey('credit-cards', session.user.id)
    const cachedCards = getCachedValue<CreditCardSummary[]>(cacheKey)
    if (cachedCards) {
      return NextResponse.json(cachedCards)
    }

    const creditCardAccounts = await prisma.financialAccount.findMany({
      where: {
        userId: session.user.id,
        type: AccountType.CREDIT_CARD,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const mappedCreditCards: CreditCardSummary[] = creditCardAccounts.map(
      (account) => ({
        id: account.id,
        name: account.name,
        balance: Math.abs(account.balance),
        limit: account.creditLimit ?? 0,
        apr: 0,
        dueDate: '',
        lastStatement: '',
      })
    )

    setCachedValue(cacheKey, mappedCreditCards, CREDIT_CARDS_CACHE_TTL_MS)

    return NextResponse.json(mappedCreditCards)
  } catch (error) {
    console.error('Credit cards fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit cards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      const body = await request.json().catch(() => ({}))
      const newCard = {
        id: `demo-card-${Date.now()}`,
        name: body?.name ?? 'Demo card',
        balance: parseFloat(body?.balance ?? 0),
        limit: parseFloat(body?.limit ?? 0),
        apr: parseFloat(body?.apr ?? 0),
        dueDate: body?.dueDate ?? new Date().toISOString().split('T')[0],
        lastStatement: new Date().toISOString().split('T')[0],
      }
      return NextResponse.json(newCard, { status: 201 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, balance, limit } = body

    // Validate required fields
    if (!name || balance === undefined || !limit) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const createdAccount = await prisma.financialAccount.create({
      data: {
        userId: session.user.id,
        name,
        type: AccountType.CREDIT_CARD,
        balance: parseFloat(balance),
        creditLimit: parseFloat(limit),
        currency: 'USD',
      },
    })

    const newCard = {
      id: createdAccount.id,
      name,
      balance: Math.abs(createdAccount.balance),
      limit: createdAccount.creditLimit ?? 0,
      apr: 0,
      dueDate: '',
      lastStatement: new Date().toISOString().split('T')[0],
    }

    invalidateCacheKey(getUserCacheKey('credit-cards', session.user.id))
    invalidateCacheKey(getUserCacheKey('accounts', session.user.id))

    return NextResponse.json(newCard, { status: 201 })
  } catch (error) {
    console.error('Credit card creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create credit card' },
      { status: 500 }
    )
  }
}
