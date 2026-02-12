import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  getCachedValue,
  getUserCacheKey,
  invalidateCacheKey,
  invalidateCacheKeys,
  setCachedValue,
} from '@/lib/server-cache'

const ACCOUNTS_CACHE_TTL_MS = 30_000

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cacheKey = getUserCacheKey('accounts', session.user.id)
    const cachedAccounts =
      getCachedValue<
        Awaited<ReturnType<typeof prisma.financialAccount.findMany>>
      >(cacheKey)
    if (cachedAccounts) {
      return NextResponse.json(cachedAccounts)
    }

    const accounts = await prisma.financialAccount.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    setCachedValue(cacheKey, accounts, ACCOUNTS_CACHE_TTL_MS)

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
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
    const { name, type, balance, currency, institution, accountNumber } = body

    if (!name || !type || balance === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const account = await prisma.financialAccount.create({
      data: {
        userId: session.user.id,
        name,
        type,
        balance: parseFloat(balance),
        currency: currency || 'USD',
        institution,
        accountNumber,
      },
    })

    invalidateCacheKey(getUserCacheKey('accounts', session.user.id))

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    await prisma.transaction.deleteMany({
      where: { userId },
    })

    await prisma.financialAccount.deleteMany({
      where: { userId },
    })

    try {
      await prisma.tellerEnrollment.deleteMany({
        where: { userId },
      })
    } catch (error) {
      if (
        !(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2021'
        )
      ) {
        throw error
      }
    }

    invalidateCacheKeys([
      getUserCacheKey('accounts', session.user.id),
      getUserCacheKey('transactions', session.user.id),
    ])

    return NextResponse.json({
      message: 'All accounts deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting all accounts:', error)
    return NextResponse.json(
      { error: 'Failed to delete all accounts' },
      { status: 500 }
    )
  }
}
