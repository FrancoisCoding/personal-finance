import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isDemoModeRequest } from '@/lib/demo-mode'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json({ ok: true })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const isTrusted =
      typeof body?.isTrusted === 'boolean' ? body.isTrusted : null

    if (isTrusted === null) {
      return NextResponse.json(
        { error: 'Invalid session update payload' },
        { status: 400 }
      )
    }

    const updatedSession = await prisma.accessSession.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        isTrusted,
      },
    })

    if (updatedSession.count === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error updating access session:', error)
    return NextResponse.json(
      { error: 'Failed to update access session' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (isDemoModeRequest(request)) {
      return NextResponse.json({ ok: true })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const deleted = await prisma.accessSession.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error revoking access session:', error)
    return NextResponse.json(
      { error: 'Failed to revoke access session' },
      { status: 500 }
    )
  }
}
