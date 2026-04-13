import { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Module mocks — declared before any imports that touch them
// ---------------------------------------------------------------------------

vi.mock('@/lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn() },
    userActivityEntry: { create: vi.fn().mockResolvedValue({}) },
    refreshToken: { create: vi.fn().mockResolvedValue({}) }
  }
}))

vi.mock('@/lib/auth/session', () => ({
  createDeviceLabel: vi.fn().mockReturnValue('test-label'),
  persistRefreshToken: vi.fn().mockResolvedValue(undefined),
  setAccessTokenCookie: vi.fn().mockResolvedValue(undefined),
  setRefreshTokenCookie: vi.fn().mockResolvedValue(undefined)
}))

// ---------------------------------------------------------------------------
// Imports after mocks are hoisted
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/auth/login/route'
import prisma from '@/lib/prisma'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
}

async function buildUser(overrides: Record<string, unknown> = {}) {
  const passwordHash = await bcrypt.hash('correct-password', 1)

  return {
    id: 'user-1',
    email: 'admin@example.com',
    passwordHash,
    role: 'OWNER',
    badgeNumber: 'USR-0001',
    loginType: 'CREDENTIAL',
    isActive: true,
    ...overrides
  }
}

const mockFindUnique = () => prisma.user.findUnique as ReturnType<typeof vi.fn>

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prisma.userActivityEntry.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
  })

  it('returns 400 for a missing body', async () => {
    const req = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: 'not-json',
      headers: { 'content-type': 'application/json' }
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for an invalid email', async () => {
    const req = makeRequest({ email: 'not-an-email', password: 'pass' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid payload')
  })

  it('returns 400 when password is missing', async () => {
    const req = makeRequest({ email: 'user@test.com' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 401 for an unknown email', async () => {
    mockFindUnique().mockResolvedValue(null)
    const req = makeRequest({ email: 'unknown@test.com', password: 'pass' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid email or password')
  })

  it('returns 403 for a deactivated account', async () => {
    const user = await buildUser({ isActive: false })
    mockFindUnique().mockResolvedValue(user)

    const req = makeRequest({ email: user.email, password: 'correct-password' })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Account deactivated')
  })

  it('returns 401 for a user with BADGE_PIN loginType', async () => {
    const user = await buildUser({ loginType: 'BADGE_PIN' })
    mockFindUnique().mockResolvedValue(user)

    const req = makeRequest({ email: user.email, password: 'correct-password' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 for a wrong password', async () => {
    const user = await buildUser()
    mockFindUnique().mockResolvedValue(user)

    const req = makeRequest({ email: user.email, password: 'wrong-password' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid email or password')
  })

  it('returns 200 with accessToken and user info on success', async () => {
    const user = await buildUser()
    mockFindUnique().mockResolvedValue(user)

    const req = makeRequest({ email: user.email, password: 'correct-password' })
    const res = await POST(req)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.accessToken).toBeDefined()
    expect(typeof body.accessToken).toBe('string')
    expect(body.user.id).toBe(user.id)
    expect(body.user.email).toBe(user.email)
    expect(body.user.role).toBe(user.role)
  })

  it('writes a LOGIN UAE entry on successful login', async () => {
    const user = await buildUser()
    mockFindUnique().mockResolvedValue(user)

    const req = makeRequest({ email: user.email, password: 'correct-password' })
    await POST(req)

    const uaeCalls = (prisma.userActivityEntry.create as ReturnType<typeof vi.fn>).mock.calls
    const loginCall = uaeCalls.find(
      (call: unknown[]) => (call[0] as { data: { actionType: string } }).data.actionType === 'LOGIN'
    )
    expect(loginCall).toBeDefined()
  })

  it('writes a LOGIN_FAILED UAE on wrong password', async () => {
    const user = await buildUser()
    mockFindUnique().mockResolvedValue(user)

    const req = makeRequest({ email: user.email, password: 'wrong' })
    await POST(req)

    const uaeCalls = (prisma.userActivityEntry.create as ReturnType<typeof vi.fn>).mock.calls
    const failCall = uaeCalls.find(
      (call: unknown[]) => (call[0] as { data: { actionType: string } }).data.actionType === 'LOGIN_FAILED'
    )
    expect(failCall).toBeDefined()
  })
})
