import { NextRequest, NextResponse } from 'next/server'

interface IRateLimitBucket {
  count: number
  resetAt: number
}

interface IGlobalRateLimitStore {
  __financeFlowRateLimitStore?: Map<string, IRateLimitBucket>
}

interface IConsumeRateLimitOptions {
  key: string
  maxRequests: number
  windowMs: number
}

export interface IRateLimitResult {
  isLimited: boolean
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

export interface IRequestRateLimitOptions {
  request: NextRequest
  scope: string
  maxRequests: number
  windowMs: number
  userId?: string
}

const getRateLimitStore = () => {
  const globalStore = globalThis as IGlobalRateLimitStore
  if (!globalStore.__financeFlowRateLimitStore) {
    globalStore.__financeFlowRateLimitStore = new Map<
      string,
      IRateLimitBucket
    >()
  }
  return globalStore.__financeFlowRateLimitStore
}

const getClientAddress = (request: NextRequest) => {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstAddress = forwardedFor
      .split(',')
      .map((value) => value.trim())
      .find(Boolean)
    if (firstAddress) {
      return firstAddress
    }
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  return 'unknown'
}

const consumeRateLimit = ({
  key,
  maxRequests,
  windowMs,
}: IConsumeRateLimitOptions): IRateLimitResult => {
  const now = Date.now()
  const store = getRateLimitStore()
  const currentBucket = store.get(key)

  if (!currentBucket || currentBucket.resetAt <= now) {
    const resetAt = now + windowMs
    const nextBucket: IRateLimitBucket = {
      count: 1,
      resetAt,
    }
    store.set(key, nextBucket)
    return {
      isLimited: false,
      remaining: Math.max(0, maxRequests - 1),
      resetAt,
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    }
  }

  currentBucket.count += 1
  store.set(key, currentBucket)

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((currentBucket.resetAt - now) / 1000)
  )

  return {
    isLimited: currentBucket.count > maxRequests,
    remaining: Math.max(0, maxRequests - currentBucket.count),
    resetAt: currentBucket.resetAt,
    retryAfterSeconds,
  }
}

export const enforceRateLimit = ({
  request,
  scope,
  maxRequests,
  windowMs,
  userId,
}: IRequestRateLimitOptions) => {
  const identifier = userId || getClientAddress(request)
  const key = `${scope}:${identifier}`
  return consumeRateLimit({ key, maxRequests, windowMs })
}

export const createRateLimitResponse = (
  result: IRateLimitResult,
  errorMessage = 'Too many requests. Please try again shortly.'
) => {
  return NextResponse.json(
    { error: errorMessage },
    {
      status: 429,
      headers: {
        'Retry-After': String(result.retryAfterSeconds),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetAt),
      },
    }
  )
}
