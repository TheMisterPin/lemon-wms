import type { NextRequest } from 'next/server'

type RateLimitBucket = {
  count: number
  resetAt: number
}

type RateLimitStore = Map<string, RateLimitBucket>

export type ApiRateLimitResult = {
  allowed: boolean
  key: string
  limit: number
  remaining: number
  resetAt: number
  retryAfterSeconds: number
}

const DEFAULT_LIMIT = 120
const DEFAULT_WINDOW_MS = 60_000
const IP_HEADERS = [
  'cf-connecting-ip',
  'true-client-ip',
  'x-real-ip',
  'x-forwarded-for'
]

const globalRateLimit = globalThis as typeof globalThis & {
  __lemonApiRateLimitStore?: RateLimitStore
}

const getStore = (): RateLimitStore => {
  if (!globalRateLimit.__lemonApiRateLimitStore) {
    globalRateLimit.__lemonApiRateLimitStore = new Map()
  }

  return globalRateLimit.__lemonApiRateLimitStore
}

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number
): number => {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback
  }

  return Math.floor(parsed)
}

export const getApiRateLimitConfig = () => ({
  limit: parsePositiveInteger(process.env.API_RATE_LIMIT_MAX_REQUESTS, DEFAULT_LIMIT),
  windowMs: parsePositiveInteger(process.env.API_RATE_LIMIT_WINDOW_MS, DEFAULT_WINDOW_MS)
})

export const getClientIp = (request: NextRequest): string => {
  for (const header of IP_HEADERS) {
    const value = request.headers.get(header)
    if (!value) {
      continue
    }

    const firstIp = value.split(',')[0]?.trim()
    if (firstIp) {
      return firstIp
    }
  }

  return 'unknown'
}

export const checkApiRateLimit = (
  request: NextRequest,
  now = Date.now()
): ApiRateLimitResult => {
  const { limit, windowMs } = getApiRateLimitConfig()
  const key = getClientIp(request)
  const store = getStore()
  const existing = store.get(key)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })

    return {
      allowed: true,
      key,
      limit,
      remaining: limit - 1,
      resetAt,
      retryAfterSeconds: 0
    }
  }

  existing.count += 1

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((existing.resetAt - now) / 1000)
  )
  const remaining = Math.max(0, limit - existing.count)

  return {
    allowed: existing.count <= limit,
    key,
    limit,
    remaining,
    resetAt: existing.resetAt,
    retryAfterSeconds: existing.count > limit ? retryAfterSeconds : 0
  }
}

export const resetApiRateLimitStore = () => {
  getStore().clear()
}
