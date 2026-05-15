import { beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const prismaMocks = vi.hoisted(() => ({
  userFindUnique: vi.fn(),
  deviceFindUnique: vi.fn()
}))

vi.mock('@/lib/prisma', () => ({
  default: {
    user: { findUnique: prismaMocks.userFindUnique },
    device: { findUnique: prismaMocks.deviceFindUnique }
  }
}))

vi.mock('@/lib/auth/session', () => ({
  readRefreshTokenCookie: vi.fn(),
  findValidRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn().mockResolvedValue(undefined),
  persistRefreshToken: vi.fn().mockResolvedValue(undefined),
  setAccessTokenCookie: vi.fn().mockResolvedValue(undefined),
  setRefreshTokenCookie: vi.fn().mockResolvedValue(undefined)
}))

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/auth/refresh/route'
import {
  findValidRefreshToken,
  readRefreshTokenCookie,
  revokeRefreshToken
} from '@/lib/auth/session'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockReadCookie = () => readRefreshTokenCookie as ReturnType<typeof vi.fn>
const mockFindToken = () => findValidRefreshToken as ReturnType<typeof vi.fn>
const mockRevoke = () => revokeRefreshToken as ReturnType<typeof vi.fn>

const activeUser = {
  id: 'user-1',
  email: 'owner@example.com',
  role: 'OWNER',
  badgeNumber: 'USR-0001',
  isActive: true
}

const validTokenRecord = {
  id: 'rt-1',
  deviceLabel: 'test-device',
  deviceId: 'dev-1',
  user: activeUser
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/auth/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMocks.userFindUnique.mockResolvedValue(null)
    prismaMocks.deviceFindUnique.mockResolvedValue(null)
  })

  it('returns 401 when no refresh token cookie is present', async () => {
    mockReadCookie().mockResolvedValue(null)

    const res = await POST()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Missing refresh token')
  })

  it('returns 401 when the token is not found in the database', async () => {
    mockReadCookie().mockResolvedValue('raw-token-xyz')
    mockFindToken().mockResolvedValue(null)

    const res = await POST()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid refresh token')
  })

  it('returns 401 when the associated user is inactive', async () => {
    mockReadCookie().mockResolvedValue('raw-token-xyz')
    mockFindToken().mockResolvedValue({
      ...validTokenRecord,
      user: { ...activeUser, isActive: false }
    })

    const res = await POST()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid refresh token')
  })

  it('returns 200 with a new accessToken and user info on success', async () => {
    mockReadCookie().mockResolvedValue('raw-token-xyz')
    mockFindToken().mockResolvedValue(validTokenRecord)

    const res = await POST()
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.accessToken).toBeDefined()
    expect(typeof body.accessToken).toBe('string')
    expect(body.user.id).toBe(activeUser.id)
    expect(body.user.role).toBe(activeUser.role)
  })

  it('revokes the old refresh token before issuing a new one (rotation)', async () => {
    mockReadCookie().mockResolvedValue('raw-token-xyz')
    mockFindToken().mockResolvedValue(validTokenRecord)

    await POST()

    expect(mockRevoke()).toHaveBeenCalledOnce()
    expect(mockRevoke()).toHaveBeenCalledWith(validTokenRecord.id)
  })

  it('new access token payload carries floor device context when linked device has a warehouse', async () => {
    mockReadCookie().mockResolvedValue('raw-token-xyz')
    mockFindToken().mockResolvedValue(validTokenRecord)
    prismaMocks.deviceFindUnique.mockResolvedValue({
      warehouseId: 'wh-99',
      zoneId: 'z-88'
    })

    const res = await POST()
    const body = await res.json()

    const payloadBase64 = body.accessToken.split('.')[1]
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString())

    expect(payload.userId).toBe(activeUser.id)
    expect(payload.role).toBe(activeUser.role)
    expect(payload.deviceId).toBe('dev-1')
    expect(payload.warehouseId).toBe('wh-99')
    expect(payload.zoneId).toBe('z-88')
  })

  it('new access token payload matches the user', async () => {
    mockReadCookie().mockResolvedValue('raw-token-xyz')
    mockFindToken().mockResolvedValue(validTokenRecord)

    const res = await POST()
    const body = await res.json()

    const payloadBase64 = body.accessToken.split('.')[1]
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString())

    expect(payload.userId).toBe(activeUser.id)
    expect(payload.role).toBe(activeUser.role)
  })
})
