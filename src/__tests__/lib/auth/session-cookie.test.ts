import { describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Track cookie options passed to cookieStore.set
// ---------------------------------------------------------------------------
const setCalls: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    set: vi.fn((name: string, value: string, options: Record<string, unknown>) => {
      setCalls.push({ name, value, options })
    }),
    delete: vi.fn(),
    get: vi.fn()
  })
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn()
    }
  }
}))

import { setAccessTokenCookie, setRefreshTokenCookie } from '@/lib/auth/session'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('setAccessTokenCookie', () => {
  it('sets maxAge to 7 days so the cookie outlives the 15m JWT expiry', async () => {
    setCalls.length = 0
    await setAccessTokenCookie('test-token')

    const call = setCalls.find((c) => c.name === 'access_token')
    expect(call).toBeDefined()

    const sevenDaysInSeconds = 60 * 60 * 24 * 7
    expect(call!.options.maxAge).toBe(sevenDaysInSeconds)
  })

  it('is not httpOnly (middleware needs to read it on Edge)', async () => {
    setCalls.length = 0
    await setAccessTokenCookie('test-token')

    const call = setCalls.find((c) => c.name === 'access_token')
    expect(call!.options.httpOnly).toBe(false)
  })

  it('uses sameSite lax', async () => {
    setCalls.length = 0
    await setAccessTokenCookie('test-token')

    const call = setCalls.find((c) => c.name === 'access_token')
    expect(call!.options.sameSite).toBe('lax')
  })

  it('sets secure=true in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    setCalls.length = 0
    await setAccessTokenCookie('test-token')

    const call = setCalls.find((c) => c.name === 'access_token')
    expect(call!.options.secure).toBe(true)

    vi.stubEnv('NODE_ENV', 'test')
  })
})

describe('setRefreshTokenCookie', () => {
  it('sets maxAge to 7 days', async () => {
    setCalls.length = 0
    await setRefreshTokenCookie('test-refresh-token')

    const call = setCalls.find((c) => c.name === 'refresh_token')
    expect(call).toBeDefined()

    const sevenDaysInSeconds = 60 * 60 * 24 * 7
    expect(call!.options.maxAge).toBe(sevenDaysInSeconds)
  })

  it('is httpOnly (JS must not read the refresh token)', async () => {
    setCalls.length = 0
    await setRefreshTokenCookie('test-refresh-token')

    const call = setCalls.find((c) => c.name === 'refresh_token')
    expect(call!.options.httpOnly).toBe(true)
  })
})
