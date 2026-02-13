import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserCacheKey, invalidateCacheKeys } from '@/lib/server-cache'
import { isDemoModeRequest } from '@/lib/demo-mode'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json({
        message: 'Demo account deleted',
        accountId: params.id,
      })
    }

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const accountId = params.id

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

    // Delete all transactions associated with this account first
    await prisma.transaction.deleteMany({
      where: {
        accountId: accountId,
        userId: session.user.id,
      },
    })

    // Delete the account
    await prisma.financialAccount.delete({
      where: {
        id: accountId,
      },
    })

    invalidateCacheKeys([
      getUserCacheKey('accounts', session.user.id),
      getUserCacheKey('transactions', session.user.id),
    ])

    return NextResponse.json({
      message: 'Account deleted successfully',
      accountId: accountId,
    })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
