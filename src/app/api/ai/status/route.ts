import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkOllamaStatus, getAvailableModels } from '@/lib/local-ai'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAvailable = await checkOllamaStatus()
    const models = isAvailable ? await getAvailableModels() : []

    return NextResponse.json({
      available: isAvailable,
      models: models,
      message: isAvailable
        ? 'Ollama is running and ready'
        : 'Ollama is not running. Please start Ollama first.',
    })
  } catch (error) {
    console.error('AI status check error:', error)
    return NextResponse.json({
      available: false,
      models: [],
      message: 'Failed to check Ollama status',
    })
  }
}
