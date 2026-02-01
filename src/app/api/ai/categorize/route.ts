import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { categorizeTransaction } from '@/lib/local-ai'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { description, amount } = await request.json()

    if (!description || amount === undefined) {
      return NextResponse.json(
        { error: 'Description and amount are required' },
        { status: 400 }
      )
    }

    const result = await categorizeTransaction(description, amount)

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI categorization error:', error)
    return NextResponse.json(
      { error: 'Failed to categorize transaction' },
      { status: 500 }
    )
  }
}
