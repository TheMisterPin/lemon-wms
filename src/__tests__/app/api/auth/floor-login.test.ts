import { NextRequest } from 'next/server'
import bcrypt from 'bcrypt'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

vi.mock('@/lib/prisma', () => ({
  default: {
    device: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    userActivityEntry: { create: vi.fn().mockResolvedValue({}) },
    refreshToken: { create: vi.fn().mockResolvedValue({}) }
  }
}))

vi.mock('@/lib/auth/session', () => ({
  persistRefreshToken: vi.fn().mockResolvedValue(undefined),
  setAccessTokenCookie: vi.fn().mockResolvedValue(undefined),
  setRefreshTokenCookie: vi.fn().mockResolvedValue(undefined)
}))

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import { POST } from '@/app/api/auth/floor/login/route'
import prisma from '@/lib/prisma'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/auth/floor/login', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' }
  })
}

const activeDevice = {
  id: 'dev-1',
  code: 'DEV-001',
  name: 'Zone-A Terminal',
  warehouseId: 'wh-1',
  zoneId: 'zone-1',
  isActive: true,
  zone: { id: 'zone-1', name: 'Zone A' }
}

async function buildWorker(overrides: Record<string, unknown> = {}) {
  const pinHash = await bcrypt.hash('1234', 1)

  return {
    id: 'user-2',
    email: null,
    badgeNumber: 'USR-0001',
    pinHash,
    role: 'WAREHOUSE_WORKER',
    loginType: 'BADGE_PIN',
    isActive: true,
    ...overrides
  }
}

const mockDevice = () => prisma.device.findUnique as ReturnType<typeof vi.fn>
const mockUser = () => prisma.user.findUnique as ReturnType<typeof vi.fn>

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/auth/floor/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(prisma.userActivityEntry.create as ReturnType<typeof vi.fn>).mockResolvedValue({})
  })

  it('returns 400 for missing fields', async () => {
    const req = makeRequest({ deviceCode: 'DEV-001' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('Invalid payload')
  })

  it('returns 400 when PIN is not 4 digits', async () => {
    const req = makeRequest({ deviceCode: 'DEV-001', badgeNumber: 'USR-0001', pin: 'abc' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 401 for an unknown device code', async () => {
    mockDevice().mockResolvedValue(null)
    const req = makeRequest({ deviceCode: 'UNKNOWN', badgeNumber: 'USR-0001', pin: '1234' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid device code')
  })

  it('returns 401 for an inactive device', async () => {
    mockDevice().mockResolvedValue({ ...activeDevice, isActive: false })
    const req = makeRequest({ deviceCode: 'DEV-001', badgeNumber: 'USR-0001', pin: '1234' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid device code')
  })

  it('returns 401 for an unknown badge number', async () => {
    mockDevice().mockResolvedValue(activeDevice)
    mockUser().mockResolvedValue(null)

    const req = makeRequest({ deviceCode: 'DEV-001', badgeNumber: 'USR-9999', pin: '1234' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid badge or PIN')
  })

  it('returns 403 for a deactivated user', async () => {
    const user = await buildWorker({ isActive: false })
    mockDevice().mockResolvedValue(activeDevice)
    mockUser().mockResolvedValue(user)

    const req = makeRequest({ deviceCode: 'DEV-001', badgeNumber: user.badgeNumber, pin: '1234' })
    const res = await POST(req)
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toBe('Account deactivated')
  })

  it('returns 401 for a user without pinHash (CREDENTIAL-only loginType)', async () => {
    const user = await buildWorker({ pinHash: null, loginType: 'CREDENTIAL' })
    mockDevice().mockResolvedValue(activeDevice)
    mockUser().mockResolvedValue(user)

    const req = makeRequest({ deviceCode: 'DEV-001', badgeNumber: user.badgeNumber, pin: '1234' })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 for a wrong PIN', async () => {
    const user = await buildWorker()
    mockDevice().mockResolvedValue(activeDevice)
    mockUser().mockResolvedValue(user)

    const req = makeRequest({ deviceCode: 'DEV-001', badgeNumber: user.badgeNumber, pin: '0000' })
    const res = await POST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Invalid badge or PIN')
  })

  it('returns 200 with tokens, user and device on success', async () => {
    const user = await buildWorker()
    mockDevice().mockResolvedValue(activeDevice)
    mockUser().mockResolvedValue(user)

    const req = makeRequest({ deviceCode: 'DEV-001', badgeNumber: user.badgeNumber, pin: '1234' })
    const res = await POST(req)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.accessToken).toBeDefined()
    expect(body.user.id).toBe(user.id)
    expect(body.user.role).toBe('WAREHOUSE_WORKER')
    expect(body.device.id).toBe(activeDevice.id)
    expect(body.device.warehouseId).toBe(activeDevice.warehouseId)
    expect(body.device.zoneId).toBe(activeDevice.zoneId)
  })

  it('access token payload contains deviceId, warehouseId and zoneId', async () => {
    const user = await buildWorker()
    mockDevice().mockResolvedValue(activeDevice)
    mockUser().mockResolvedValue(user)

    const req = makeRequest({ deviceCode: 'DEV-001', badgeNumber: user.badgeNumber, pin: '1234' })
    const res = await POST(req)
    const body = await res.json()

    // Decode without verifying to inspect payload
    const payloadBase64 = body.accessToken.split('.')[1]
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString())

    expect(payload.deviceId).toBe(activeDevice.id)
    expect(payload.warehouseId).toBe(activeDevice.warehouseId)
    expect(payload.zoneId).toBe(activeDevice.zoneId)
  })
})
