type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const serverCache = new Map<string, CacheEntry<unknown>>()

export const DEFAULT_CACHE_TTL_MS = 30_000

export const getUserCacheKey = (namespace: string, userId: string) =>
  `${namespace}:${userId}`

export const getCachedValue = <T>(key: string): T | null => {
  const entry = serverCache.get(key)
  if (!entry) {
    return null
  }
  if (entry.expiresAt <= Date.now()) {
    serverCache.delete(key)
    return null
  }
  return entry.value as T
}

export const setCachedValue = <T>(
  key: string,
  value: T,
  ttlMs = DEFAULT_CACHE_TTL_MS
) => {
  serverCache.set(key, { value, expiresAt: Date.now() + ttlMs })
}

export const invalidateCacheKey = (key: string) => {
  serverCache.delete(key)
}

export const invalidateCacheKeys = (keys: string[]) => {
  keys.forEach((key) => serverCache.delete(key))
}
