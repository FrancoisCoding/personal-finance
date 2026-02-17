import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeRequest } from '@/lib/demo-mode'

const mapAccessSession = (
  sessionRecord: {
    id: string
    name: string
    location: string
    isTrusted: boolean
    lastActiveAt: Date
    sessionKey: string
  },
  currentSessionKey: string
) => ({
  id: sessionRecord.id,
  name: sessionRecord.name,
  location: sessionRecord.location,
  isTrusted: sessionRecord.isTrusted,
  isCurrent: sessionRecord.sessionKey === currentSessionKey,
  lastActiveAt: sessionRecord.lastActiveAt.toISOString(),
})

const getCurrentSessionKey = (request: NextRequest) =>
  request.headers.get('x-access-session-key') ?? ''

const getRequestLocation = (request: NextRequest) =>
  request.headers.get('x-vercel-ip-country') ||
  request.headers.get('cf-ipcountry') ||
  'Unknown location'

export async function GET(request: NextRequest) {
  try {
    const currentSessionKey = getCurrentSessionKey(request)

    if (isDemoModeRequest(request)) {
      const now = new Date()
      return NextResponse.json([
        {
          id: 'demo-session-current',
          name: 'Current browser',
          location: 'United States',
          isTrusted: true,
          isCurrent: true,
          lastActiveAt: now.toISOString(),
        },
      ])
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessions = await prisma.accessSession.findMany({
      where: { userId: session.user.id },
      orderBy: { lastActiveAt: 'desc' },
      take: 12,
    })

    return NextResponse.json(
      sessions.map((sessionRecord) =>
        mapAccessSession(sessionRecord, currentSessionKey)
      )
    )
  } catch (error) {
    console.error('Error fetching access sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch access sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const currentSessionKey = body?.sessionKey || getCurrentSessionKey(request)
    if (!currentSessionKey) {
      return NextResponse.json(
        { error: 'Missing session key' },
        { status: 400 }
      )
    }

    if (isDemoModeRequest(request)) {
      return NextResponse.json({ ok: true })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionName =
      typeof body?.name === 'string' && body.name.trim().length > 0
        ? body.name.trim()
        : 'Browser session'
    const sessionLocation = getRequestLocation(request)

    const persisted = await prisma.accessSession.upsert({
      where: {
        userId_sessionKey: {
          userId: session.user.id,
          sessionKey: currentSessionKey,
        },
      },
      create: {
        userId: session.user.id,
        sessionKey: currentSessionKey,
        name: sessionName,
        location: sessionLocation,
        lastActiveAt: new Date(),
      },
      update: {
        name: sessionName,
        location: sessionLocation,
        lastActiveAt: new Date(),
      },
    })

    return NextResponse.json(mapAccessSession(persisted, currentSessionKey))
  } catch (error) {
    console.error('Error syncing access session:', error)
    return NextResponse.json(
      { error: 'Failed to sync access session' },
      { status: 500 }
    )
  }
}
