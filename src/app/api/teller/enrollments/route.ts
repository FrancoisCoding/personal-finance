import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTellerEnvironment } from '@/lib/teller'
import { syncTellerEnrollment } from '@/lib/teller-sync'

interface TellerEnrollmentPayload {
  accessToken?: string
  access_token?: string
  enrollment?: {
    id?: string
    institution?: {
      name?: string | null
    } | null
  } | null
  institution?: {
    name?: string | null
  } | null
  id?: string
}

const getAccessToken = (payload: TellerEnrollmentPayload) =>
  payload.accessToken || payload.access_token || null

const getEnrollmentId = (payload: TellerEnrollmentPayload) =>
  payload.enrollment?.id || payload.id || null

const getInstitutionName = (payload: TellerEnrollmentPayload) =>
  payload.enrollment?.institution?.name || payload.institution?.name || null

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { enrollment } = (await request.json()) as {
    enrollment?: TellerEnrollmentPayload
  }

  if (!enrollment) {
    return NextResponse.json(
      { error: 'Enrollment payload is required' },
      { status: 400 }
    )
  }

  const accessToken = getAccessToken(enrollment)
  const enrollmentId = getEnrollmentId(enrollment)
  if (!accessToken || !enrollmentId) {
    return NextResponse.json(
      { error: 'Enrollment access token is missing' },
      { status: 400 }
    )
  }

  const institutionName = getInstitutionName(enrollment)
  const environment = getTellerEnvironment()
  const hasCertificate =
    !!process.env.TELLER_CERT || !!process.env.TELLER_CERT_PATH
  const hasPrivateKey = !!process.env.TELLER_KEY || !!process.env.TELLER_KEY_PATH
  const canSync =
    environment === 'sandbox' || (hasCertificate && hasPrivateKey)

  await prisma.tellerEnrollment.upsert({
    where: { enrollmentId },
    update: {
      accessToken,
      institutionName,
      environment,
      updatedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      enrollmentId,
      accessToken,
      institutionName,
      environment,
    },
  })

  if (!canSync) {
    return NextResponse.json({
      message:
        'Teller enrollment saved. Sync skipped because mTLS credentials are missing.',
      accountsSynced: 0,
      transactionsSynced: 0,
      syncSkipped: true,
    })
  }

  try {
    const syncResult = await syncTellerEnrollment({
      userId: session.user.id,
      accessToken,
    })

    return NextResponse.json({
      message: 'Teller enrollment saved',
      ...syncResult,
    })
  } catch (error) {
    console.error('Failed to sync Teller enrollment:', error)
    return NextResponse.json({
      message: 'Teller enrollment saved, but sync failed.',
      accountsSynced: 0,
      transactionsSynced: 0,
      syncError: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
