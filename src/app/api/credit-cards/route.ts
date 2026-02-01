import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return mock data. In a real app, you'd fetch from your database
    // You can create a CreditCard model in your Prisma schema if needed
    const mockCreditCards = [
      {
        id: '1',
        name: 'Chase Freedom Unlimited',
        balance: 2500,
        limit: 15000,
        apr: 18.99,
        dueDate: '2024-01-25',
        lastStatement: '2024-01-01',
      },
      {
        id: '2',
        name: 'American Express Gold',
        balance: 1800,
        limit: 25000,
        apr: 16.99,
        dueDate: '2024-01-28',
        lastStatement: '2024-01-05',
      },
      {
        id: '3',
        name: 'Discover It',
        balance: 3200,
        limit: 12000,
        apr: 19.99,
        dueDate: '2024-01-30',
        lastStatement: '2024-01-03',
      },
    ]

    return NextResponse.json(mockCreditCards)
  } catch (error) {
    console.error('Credit cards fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit cards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, balance, limit, apr, dueDate } = body

    // Validate required fields
    if (!name || balance === undefined || !limit || !apr) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real app, you'd save to your database
    // For now, return the created card
    const newCard = {
      id: Date.now().toString(),
      name,
      balance: parseFloat(balance),
      limit: parseFloat(limit),
      apr: parseFloat(apr),
      dueDate,
      lastStatement: new Date().toISOString().split('T')[0],
    }

    return NextResponse.json(newCard, { status: 201 })
  } catch (error) {
    console.error('Credit card creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create credit card' },
      { status: 500 }
    )
  }
}
