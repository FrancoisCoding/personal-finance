import {
  DEFAULT_CACHE_TTL_MS,
  getCachedValue,
  getUserCacheKey,
  invalidateCacheKey,
  invalidateCacheKeys,
  setCachedValue,
} from '@/lib/server-cache'

describe('server-cache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-12T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('stores and retrieves cached values', () => {
    const key = getUserCacheKey('accounts', 'user-1')
    const value = [{ id: 'acc-1' }]

    setCachedValue(key, value, DEFAULT_CACHE_TTL_MS)

    expect(getCachedValue<typeof value>(key)).toEqual(value)
  })

  it('expires cached values after ttl', () => {
    const key = getUserCacheKey('transactions', 'user-1')
    setCachedValue(key, 'value', 1000)

    vi.advanceTimersByTime(1001)

    expect(getCachedValue<string>(key)).toBeNull()
  })

  it('invalidates cache keys', () => {
    const key = getUserCacheKey('budgets', 'user-1')
    setCachedValue(key, { id: 'budget-1' })

    invalidateCacheKey(key)

    expect(getCachedValue(key)).toBeNull()
  })

  it('invalidates multiple cache keys', () => {
    const keys = [
      getUserCacheKey('goals', 'user-1'),
      getUserCacheKey('categories', 'user-1'),
    ]
    keys.forEach((key) => setCachedValue(key, { id: key }))

    invalidateCacheKeys(keys)

    expect(getCachedValue(keys[0])).toBeNull()
    expect(getCachedValue(keys[1])).toBeNull()
  })

  it('builds user cache keys', () => {
    expect(getUserCacheKey('subscriptions', 'user-99')).toBe(
      'subscriptions:user-99'
    )
  })
})
