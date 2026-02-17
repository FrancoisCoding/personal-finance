import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReminderPriority, ReminderType } from '@prisma/client'
import { isDemoModeRequest } from '@/lib/demo-mode'

const mapReminder = (reminder: {
  id: string
  title: string
  description: string | null
  dueAt: Date
  type: ReminderType
  priority: ReminderPriority
  isCompleted: boolean
}) => ({
  id: reminder.id,
  title: reminder.title,
  description: reminder.description ?? '',
  dueAt: reminder.dueAt.toISOString(),
  type: reminder.type.toLowerCase() as 'budget' | 'bill' | 'goal' | 'custom',
  priority: reminder.priority.toLowerCase() as 'low' | 'medium' | 'high',
  completed: reminder.isCompleted,
})

const parseReminderType = (value: unknown): ReminderType => {
  if (typeof value !== 'string') return ReminderType.CUSTOM
  const normalized = value.toUpperCase()
  if (normalized in ReminderType) {
    return normalized as ReminderType
  }
  return ReminderType.CUSTOM
}

const parseReminderPriority = (value: unknown): ReminderPriority => {
  if (typeof value !== 'string') return ReminderPriority.MEDIUM
  const normalized = value.toUpperCase()
  if (normalized in ReminderPriority) {
    return normalized as ReminderPriority
  }
  return ReminderPriority.MEDIUM
}

export async function GET(request: NextRequest) {
  try {
    if (isDemoModeRequest(request)) {
      const now = new Date()
      const demoReminders = [
        {
          id: 'demo-reminder-1',
          title: 'Review monthly budget',
          description: 'Check category overages before month end.',
          dueAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
          type: ReminderType.BUDGET,
          priority: ReminderPriority.HIGH,
          isCompleted: false,
        },
        {
          id: 'demo-reminder-2',
          title: 'Pay card statement',
          description: 'Confirm payment clears before due date.',
          dueAt: new Date(now.getTime() + 28 * 60 * 60 * 1000),
          type: ReminderType.BILL,
          priority: ReminderPriority.MEDIUM,
          isCompleted: false,
        },
      ]
      return NextResponse.json(demoReminders.map(mapReminder))
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isCompleted: 'asc' }, { dueAt: 'asc' }],
    })

    return NextResponse.json(reminders.map(mapReminder))
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reminders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const title = typeof body?.title === 'string' ? body.title.trim() : ''
    const description =
      typeof body?.description === 'string' ? body.description.trim() : ''
    const dueAt = typeof body?.dueAt === 'string' ? new Date(body.dueAt) : null

    if (!title || !dueAt || Number.isNaN(dueAt.getTime())) {
      return NextResponse.json(
        { error: 'Missing or invalid reminder fields' },
        { status: 400 }
      )
    }

    if (isDemoModeRequest(request)) {
      return NextResponse.json(
        mapReminder({
          id: `demo-reminder-${Date.now()}`,
          title,
          description,
          dueAt,
          type: parseReminderType(body?.type),
          priority: parseReminderPriority(body?.priority),
          isCompleted: false,
        }),
        { status: 201 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: session.user.id,
        title,
        description: description || null,
        dueAt,
        type: parseReminderType(body?.type),
        priority: parseReminderPriority(body?.priority),
      },
    })

    return NextResponse.json(mapReminder(reminder), { status: 201 })
  } catch (error) {
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to create reminder' },
      { status: 500 }
    )
  }
}
