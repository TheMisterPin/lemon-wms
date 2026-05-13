import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  checkApiRateLimit,
  getApiRateLimitConfig,
  getClientIp,
  resetApiRateLimitStore
} from '@/lib/api/rate-limit'

const makeRequest = (headers: Record<string, string> = {}) =>
  new NextRequest('http://localhost/api/test', { headers })

describe('api rate limit helpers', () => {
  afterEach(() => {
    resetApiRateLimitStore()
    vi.unstubAllEnvs()
  })

  it('uses safe defaults when env config is not set', () => {
    expect(getApiRateLimitConfig()).toEqual({
      limit: 120,
      windowMs: 60_000
    })
  })

  it('reads positive integer env overrides', () => {
    vi.stubEnv('API_RATE_LIMIT_MAX_REQUESTS', '3')
    vi.stubEnv('API_RATE_LIMIT_WINDOW_MS', '1000')

    expect(getApiRateLimitConfig()).toEqual({
      limit: 3,
      windowMs: 1000
    })
  })

  it('extracts the first forwarded IP address', () => {
    const request = makeRequest({
      'x-forwarded-for': '203.0.113.10, 10.0.0.1'
    })

    expect(getClientIp(request)).toBe('203.0.113.10')
  })

  it('prefers direct proxy IP headers over x-forwarded-for', () => {
    const request = makeRequest({
      'cf-connecting-ip': '198.51.100.7',
      'x-forwarded-for': '203.0.113.10'
    })

    expect(getClientIp(request)).toBe('198.51.100.7')
  })

  it('blocks requests over the configured limit for the same IP', () => {
    vi.stubEnv('API_RATE_LIMIT_MAX_REQUESTS', '2')
    vi.stubEnv('API_RATE_LIMIT_WINDOW_MS', '10000')

    const request = makeRequest({ 'x-forwarded-for': '203.0.113.10' })

    expect(checkApiRateLimit(request, 1000).allowed).toBe(true)
    expect(checkApiRateLimit(request, 2000).allowed).toBe(true)

    const blocked = checkApiRateLimit(request, 3000)
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.retryAfterSeconds).toBe(8)
  })

  it('starts a new bucket after the window resets', () => {
    vi.stubEnv('API_RATE_LIMIT_MAX_REQUESTS', '1')
    vi.stubEnv('API_RATE_LIMIT_WINDOW_MS', '1000')

    const request = makeRequest({ 'x-real-ip': '203.0.113.11' })

    expect(checkApiRateLimit(request, 1000).allowed).toBe(true)
    expect(checkApiRateLimit(request, 1500).allowed).toBe(false)
    expect(checkApiRateLimit(request, 2000).allowed).toBe(true)
  })
})
