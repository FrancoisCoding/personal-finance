import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeRequest } from '@/lib/demo-mode'

const notificationHistoryLimit = 160
const defaultThrottleMinutes = 240
const allowedNotificationTypes = new Set([
  'success',
  'error',
  'warning',
  'info',
])

const mapAlertNotification = (notification: {
  id: string
  type: string
  title: string
  message: string
  timestamp: Date
  read: boolean
  showToast: boolean
  dedupeKey: string | null
  throttleMinutes: number | null
  ruleId: string | null
  category: string | null
}) => ({
  id: notification.id,
  type: allowedNotificationTypes.has(notification.type)
    ? notification.type
    : 'info',
  title: notification.title,
  message: notification.message,
  timestamp: notification.timestamp.toISOString(),
  read: notification.read,
  showToast: notification.showToast,
  dedupeKey: notification.dedupeKey ?? undefined,
  throttleMinutes: notification.throttleMinutes ?? undefined,
  ruleId: notification.ruleId ?? undefined,
  category: notification.category ?? undefined,
})

const parseString = (value: unknown) => {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim()
}

const parseBoolean = (value: unknown, defaultValue: boolean) => {
  if (typeof value === 'boolean') {
    return value
  }
  return defaultValue
}

const parseThrottleMinutes = (value: unknown) => {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return undefined
  }
  return Math.round(value)
}

export async function GET(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json({ notifications: [], ruleState: {} })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [notifications, rulePreferences] = await Promise.all([
      prisma.alertNotification.findMany({
        where: { userId: session.user.id },
        orderBy: { timestamp: 'desc' },
        take: notificationHistoryLimit,
      }),
      prisma.alertRulePreference.findMany({
        where: { userId: session.user.id },
      }),
    ])

    const ruleState = rulePreferences.reduce<Record<string, boolean>>(
      (acc, rulePreference) => {
        acc[rulePreference.ruleId] = rulePreference.isEnabled
        return acc
      },
      {}
    )

    return NextResponse.json({
      notifications: notifications.map(mapAlertNotification),
      ruleState,
    })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const title = parseString(body?.title)
    const message = parseString(body?.message)
    const type = parseString(body?.type)
    const dedupeKey = parseString(body?.dedupeKey)
    const ruleId = parseString(body?.ruleId)
    const category = parseString(body?.category)
    const throttleMinutes =
      parseThrottleMinutes(body?.throttleMinutes) ?? defaultThrottleMinutes

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Missing required notification fields' },
        { status: 400 }
      )
    }

    const timestampValue = parseString(body?.timestamp)
    const parsedTimestamp = timestampValue ? new Date(timestampValue) : null
    const timestamp =
      parsedTimestamp && !Number.isNaN(parsedTimestamp.getTime())
        ? parsedTimestamp
        : new Date()

    if (isDemoModeRequest(request)) {
      return NextResponse.json(
        {
          id: `demo-alert-${Date.now()}`,
          type: allowedNotificationTypes.has(type) ? type : 'info',
          title,
          message,
          timestamp: timestamp.toISOString(),
          read: parseBoolean(body?.read, false),
          showToast: parseBoolean(body?.showToast, true),
          dedupeKey: dedupeKey || undefined,
          throttleMinutes,
          ruleId: ruleId || undefined,
          category: category || undefined,
        },
        { status: 201 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (dedupeKey) {
      const existing = await prisma.alertNotification.findFirst({
        where: {
          userId: session.user.id,
          dedupeKey,
        },
        orderBy: { timestamp: 'desc' },
      })
      if (existing) {
        const elapsedMs = Date.now() - existing.timestamp.getTime()
        const throttleMs = throttleMinutes * 60 * 1000
        if (elapsedMs < throttleMs) {
          return NextResponse.json(mapAlertNotification(existing))
        }
      }
    }

    const notification = await prisma.alertNotification.create({
      data: {
        userId: session.user.id,
        type: allowedNotificationTypes.has(type) ? type : 'info',
        title,
        message,
        timestamp,
        read: parseBoolean(body?.read, false),
        showToast: parseBoolean(body?.showToast, true),
        dedupeKey: dedupeKey || null,
        throttleMinutes: throttleMinutes ?? null,
        ruleId: ruleId || null,
        category: category || null,
      },
    })

    return NextResponse.json(mapAlertNotification(notification), {
      status: 201,
    })
  } catch (error) {
    console.error('Error creating alert notification:', error)
    return NextResponse.json(
      { error: 'Failed to create alert notification' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json({ ok: true })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const action = parseString(body?.action)

    if (!action) {
      return NextResponse.json(
        { error: 'Missing alert action' },
        { status: 400 }
      )
    }

    if (action === 'mark-read') {
      const id = parseString(body?.id)
      if (!id) {
        return NextResponse.json({ error: 'Missing alert id' }, { status: 400 })
      }
      await prisma.alertNotification.updateMany({
        where: {
          id,
          userId: session.user.id,
        },
        data: {
          read: true,
        },
      })
      return NextResponse.json({ ok: true })
    }

    if (action === 'mark-all-read') {
      const result = await prisma.alertNotification.updateMany({
        where: {
          userId: session.user.id,
          read: false,
        },
        data: {
          read: true,
        },
      })
      return NextResponse.json({ ok: true, count: result.count })
    }

    if (action === 'clear-read') {
      const result = await prisma.alertNotification.deleteMany({
        where: {
          userId: session.user.id,
          read: true,
        },
      })
      return NextResponse.json({ ok: true, count: result.count })
    }

    if (action === 'clear-all') {
      const result = await prisma.alertNotification.deleteMany({
        where: {
          userId: session.user.id,
        },
      })
      return NextResponse.json({ ok: true, count: result.count })
    }

    if (action === 'remove') {
      const id = parseString(body?.id)
      if (!id) {
        return NextResponse.json({ error: 'Missing alert id' }, { status: 400 })
      }
      const result = await prisma.alertNotification.deleteMany({
        where: {
          id,
          userId: session.user.id,
        },
      })
      return NextResponse.json({ ok: true, count: result.count })
    }

    if (action === 'set-rule') {
      const ruleId = parseString(body?.ruleId)
      if (!ruleId || typeof body?.enabled !== 'boolean') {
        return NextResponse.json(
          { error: 'Missing rule preference fields' },
          { status: 400 }
        )
      }
      await prisma.alertRulePreference.upsert({
        where: {
          userId_ruleId: {
            userId: session.user.id,
            ruleId,
          },
        },
        create: {
          userId: session.user.id,
          ruleId,
          isEnabled: body.enabled,
        },
        update: {
          isEnabled: body.enabled,
        },
      })
      return NextResponse.json({ ok: true })
    }

    if (action === 'reset-rules') {
      const result = await prisma.alertRulePreference.deleteMany({
        where: {
          userId: session.user.id,
        },
      })
      return NextResponse.json({ ok: true, count: result.count })
    }

    return NextResponse.json(
      { error: 'Unsupported alert action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating alerts:', error)
    return NextResponse.json(
      { error: 'Failed to update alerts' },
      { status: 500 }
    )
  }
}
