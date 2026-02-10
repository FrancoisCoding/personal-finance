import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { syncTellerEnrollment } from '@/lib/teller-sync'

export async function POST() {
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
      const result = await syncTellerEnrollment({
        userId: session.user.id,
        accessToken: enrollment.accessToken,
      })
      accountsSynced += result.accountsSynced
      transactionsSynced += result.transactionsSynced
    } catch (error) {
      console.error(
        `Error syncing Teller enrollment ${enrollment.enrollmentId}:`,
        error
      )
    }
  }

  return NextResponse.json({
    message: 'Teller sync complete',
    accountsSynced,
    transactionsSynced,
  })
}
