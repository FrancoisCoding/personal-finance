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

export interface IIdentifierRateLimitOptions {
  identifier: string
  scope: string
  maxRequests: number
  windowMs: number
}

interface IRateLimitStoreConfig {
  restToken: string
  restUrl: string
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

const getRateLimitStoreConfig = (): IRateLimitStoreConfig | null => {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL?.trim() || ''
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || ''

  if (!restUrl || !restToken) {
    return null
  }

  return {
    restToken,
    restUrl: restUrl.replace(/\/+$/, ''),
  }
}

let hasLoggedDistributedRateLimitFallback = false

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

const createRateLimitResult = (
  count: number,
  maxRequests: number,
  ttlMs: number
): IRateLimitResult => {
  const normalizedTtlMs = Math.max(1, ttlMs)

  return {
    isLimited: count > maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetAt: Date.now() + normalizedTtlMs,
    retryAfterSeconds: Math.max(1, Math.ceil(normalizedTtlMs / 1000)),
  }
}

const executeRedisCommand = async (
  config: IRateLimitStoreConfig,
  commandParts: Array<string | number>
) => {
  const encodedCommand = commandParts
    .map((commandPart) => encodeURIComponent(String(commandPart)))
    .join('/')
  const response = await fetch(`${config.restUrl}/${encodedCommand}`, {
    headers: {
      Authorization: `Bearer ${config.restToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Rate-limit store returned ${response.status}`)
  }

  const payload = (await response.json().catch(() => ({}))) as {
    error?: string
    result?: unknown
  }

  if (payload.error) {
    throw new Error(payload.error)
  }

  return payload.result
}

const consumeDistributedRateLimit = async ({
  key,
  maxRequests,
  windowMs,
}: IConsumeRateLimitOptions): Promise<IRateLimitResult> => {
  const config = getRateLimitStoreConfig()
  if (!config) {
    return consumeRateLimit({ key, maxRequests, windowMs })
  }

  const distributedKey = `financeflow:ratelimit:${key}`
  const incrementResult = await executeRedisCommand(config, [
    'INCR',
    distributedKey,
  ])
  const count =
    typeof incrementResult === 'number' && Number.isFinite(incrementResult)
      ? incrementResult
      : 1

  if (count <= 1) {
    await executeRedisCommand(config, ['PEXPIRE', distributedKey, windowMs])
  }

  const ttlResult = await executeRedisCommand(config, ['PTTL', distributedKey])
  const ttlMs =
    typeof ttlResult === 'number' && Number.isFinite(ttlResult) && ttlResult > 0
      ? ttlResult
      : windowMs

  return createRateLimitResult(count, maxRequests, ttlMs)
}

const consumeRateLimitWithFallback = async (
  options: IConsumeRateLimitOptions
): Promise<IRateLimitResult> => {
  try {
    return await consumeDistributedRateLimit(options)
  } catch (error) {
    if (!hasLoggedDistributedRateLimitFallback) {
      hasLoggedDistributedRateLimitFallback = true
      console.warn(
        'Distributed rate limit unavailable; falling back to in-memory store.',
        error
      )
    }

    return consumeRateLimit(options)
  }
}

export const enforceIdentifierRateLimit = async ({
  identifier,
  scope,
  maxRequests,
  windowMs,
}: IIdentifierRateLimitOptions) => {
  const normalizedIdentifier = identifier.trim() || 'unknown'
  const key = `${scope}:${normalizedIdentifier}`
  return consumeRateLimitWithFallback({ key, maxRequests, windowMs })
}

export const enforceRateLimit = async ({
  request,
  scope,
  maxRequests,
  windowMs,
  userId,
}: IRequestRateLimitOptions) => {
  const identifier = userId || getClientAddress(request)
  return enforceIdentifierRateLimit({
    identifier,
    scope,
    maxRequests,
    windowMs,
  })
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
