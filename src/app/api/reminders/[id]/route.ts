import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReminderPriority, ReminderType } from '@prisma/client'
import { isDemoModeRequest } from '@/lib/demo-mode'

const parseReminderType = (value: unknown): ReminderType | undefined => {
  if (typeof value !== 'string') return undefined
  const normalized = value.toUpperCase()
  if (normalized in ReminderType) {
    return normalized as ReminderType
  }
  return undefined
}

const parseReminderPriority = (
  value: unknown
): ReminderPriority | undefined => {
  if (typeof value !== 'string') return undefined
  const normalized = value.toUpperCase()
  if (normalized in ReminderPriority) {
    return normalized as ReminderPriority
  }
  return undefined
}

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

interface IRouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: IRouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json().catch(() => ({}))
    const updates: {
      title?: string
      description?: string | null
      dueAt?: Date
      type?: ReminderType
      priority?: ReminderPriority
      isCompleted?: boolean
      completedAt?: Date | null
    } = {}

    if (typeof body?.title === 'string') {
      updates.title = body.title.trim()
    }
    if (typeof body?.description === 'string') {
      updates.description = body.description.trim() || null
    }
    if (typeof body?.dueAt === 'string') {
      const dueAtDate = new Date(body.dueAt)
      if (Number.isNaN(dueAtDate.getTime())) {
        return NextResponse.json({ error: 'Invalid due date' }, { status: 400 })
      }
      updates.dueAt = dueAtDate
    }

    const parsedType = parseReminderType(body?.type)
    if (parsedType) {
      updates.type = parsedType
    }
    const parsedPriority = parseReminderPriority(body?.priority)
    if (parsedPriority) {
      updates.priority = parsedPriority
    }
    if (typeof body?.completed === 'boolean') {
      updates.isCompleted = body.completed
      updates.completedAt = body.completed ? new Date() : null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No reminder updates' },
        { status: 400 }
      )
    }

    if (isDemoModeRequest(request)) {
      return NextResponse.json({
        id,
        title: updates.title ?? 'Demo reminder',
        description: updates.description ?? '',
        dueAt: (updates.dueAt ?? new Date()).toISOString(),
        type: (updates.type ?? ReminderType.CUSTOM).toLowerCase(),
        priority: (updates.priority ?? ReminderPriority.MEDIUM).toLowerCase(),
        completed: updates.isCompleted ?? false,
      })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingReminder = await prisma.reminder.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!existingReminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    const updatedReminder = await prisma.reminder.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(mapReminder(updatedReminder))
  } catch (error) {
    console.error('Error updating reminder:', error)
    return NextResponse.json(
      { error: 'Failed to update reminder' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: IRouteContext) {
  try {
    const { id } = await context.params
    if (isDemoModeRequest(request)) {
      return NextResponse.json({ ok: true })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deleted = await prisma.reminder.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting reminder:', error)
    return NextResponse.json(
      { error: 'Failed to delete reminder' },
      { status: 500 }
    )
  }
}
