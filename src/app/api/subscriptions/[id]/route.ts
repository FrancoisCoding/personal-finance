import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserCacheKey, invalidateCacheKey } from '@/lib/server-cache'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptionId = params.id
    const existing = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Subscription not found or unauthorized' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const updateData: {
      name?: string
      amount?: number
      billingCycle?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'
      nextBillingDate?: Date
      categoryId?: string | null
      isActive?: boolean
      notes?: string | null
    } = {}

    if (typeof body.name === 'string') {
      updateData.name = body.name
    }
    if (body.amount !== undefined && body.amount !== null) {
      updateData.amount = Number.parseFloat(body.amount)
    }
    if (body.billingCycle) {
      updateData.billingCycle = body.billingCycle
    }
    if (body.nextBillingDate) {
      updateData.nextBillingDate = new Date(body.nextBillingDate)
    }
    if (body.categoryId !== undefined) {
      updateData.categoryId = body.categoryId || null
    }
    if (body.isActive !== undefined) {
      updateData.isActive = Boolean(body.isActive)
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes || null
    }

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: updateData,
      include: {
        category: true,
      },
    })

    invalidateCacheKey(getUserCacheKey('subscriptions', session.user.id))

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscriptionId = params.id
    const existing = await prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Subscription not found or unauthorized' },
        { status: 404 }
      )
    }

    await prisma.subscription.delete({
      where: {
        id: subscriptionId,
      },
    })

    invalidateCacheKey(getUserCacheKey('subscriptions', session.user.id))

    return NextResponse.json({
      message: 'Subscription deleted successfully',
      subscriptionId,
    })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}
