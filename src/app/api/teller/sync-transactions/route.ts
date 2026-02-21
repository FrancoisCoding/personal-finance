import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { syncTellerEnrollment } from '@/lib/teller-sync'
import { getUserCacheKey, invalidateCacheKeys } from '@/lib/server-cache'
import { revalidateUserDataCacheTags } from '@/lib/data-cache'
import { buildDemoData } from '@/lib/demo-data'
import { isDemoModeRequest } from '@/lib/demo-mode'
import {
  decryptTellerAccessToken,
  encryptTellerAccessToken,
  isEncryptedTellerAccessToken,
} from '@/lib/teller-token-crypto'
import { applyAutoDetectedUserCurrency } from '@/lib/user-preference-service'

export async function POST(request: NextRequest) {
  if (isDemoModeRequest(request)) {
    const demoData = buildDemoData()
    return NextResponse.json({
      message: 'Demo sync complete',
      accountsSynced: demoData.accounts.length,
      transactionsSynced: demoData.transactions.length,
    })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const enrollments = await prisma.tellerEnrollment.findMany({
    where: { userId: session.user.id },
  })

  if (enrollments.length === 0) {
    return NextResponse.json({
      message: 'No Teller enrollments found',
      accountsSynced: 0,
      transactionsSynced: 0,
    })
  }

  let accountsSynced = 0
  let transactionsSynced = 0

  for (const enrollment of enrollments) {
    try {
      const accessToken = decryptTellerAccessToken(enrollment.accessToken)
      const result = await syncTellerEnrollment({
        userId: session.user.id,
        accessToken,
      })
      accountsSynced += result.accountsSynced
      transactionsSynced += result.transactionsSynced

      if (!isEncryptedTellerAccessToken(enrollment.accessToken)) {
        await prisma.tellerEnrollment.update({
          where: { id: enrollment.id },
          data: { accessToken: encryptTellerAccessToken(accessToken) },
        })
      }
    } catch (error) {
      console.error(
        `Error syncing Teller enrollment ${enrollment.enrollmentId}:`,
        error
      )
    }
  }

  if (accountsSynced > 0) {
    await applyAutoDetectedUserCurrency(session.user.id)
  }

  invalidateCacheKeys([
    getUserCacheKey('accounts', session.user.id),
    getUserCacheKey('transactions', session.user.id),
  ])
  revalidateUserDataCacheTags(session.user.id, ['accounts', 'transactions'])

  return NextResponse.json({
    message: 'Teller sync complete',
    accountsSynced,
    transactionsSynced,
  })
}
