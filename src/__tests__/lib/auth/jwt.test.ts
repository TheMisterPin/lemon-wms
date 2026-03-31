import jwt from 'jsonwebtoken'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { signAccessToken, signRefreshToken, verifyToken } from '@/lib/auth/jwt'

const SECRET = 'test-secret-for-unit-tests-at-least-32-chars'

describe('signAccessToken', () => {
  it('returns a valid JWT string', () => {
    const token = signAccessToken({ userId: 'u1', role: 'OWNER' })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('encodes the payload correctly', () => {
    const token = signAccessToken({ userId: 'u1', role: 'OFFICE_MANAGER' })
    const decoded = jwt.verify(token, SECRET) as Record<string, unknown>
    expect(decoded.userId).toBe('u1')
    expect(decoded.role).toBe('OFFICE_MANAGER')
  })

  it('includes optional floor fields when provided', () => {
    const token = signAccessToken({
      userId: 'u2',
      role: 'WAREHOUSE_WORKER',
      deviceId: 'd1',
      zoneId: 'z1',
      warehouseId: 'w1',
    })
    const decoded = jwt.verify(token, SECRET) as Record<string, unknown>
    expect(decoded.deviceId).toBe('d1')
    expect(decoded.zoneId).toBe('z1')
    expect(decoded.warehouseId).toBe('w1')
  })

  it('sets an expiry on the token', () => {
    const token = signAccessToken({ userId: 'u1', role: 'OWNER' })
    const decoded = jwt.verify(token, SECRET) as Record<string, unknown>
    expect(decoded.exp).toBeDefined()
  })
})

describe('signRefreshToken', () => {
  it('returns a valid JWT string', () => {
    const token = signRefreshToken({ userId: 'u1' })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })

  it('encodes userId correctly', () => {
    const token = signRefreshToken({ userId: 'u1' })
    const decoded = jwt.verify(token, SECRET) as Record<string, unknown>
    expect(decoded.userId).toBe('u1')
  })

  it('sets a longer expiry than access tokens', () => {
    const access = signAccessToken({ userId: 'u1', role: 'OWNER' })
    const refresh = signRefreshToken({ userId: 'u1' })

    const decodedAccess = jwt.verify(access, SECRET) as Record<string, unknown>
    const decodedRefresh = jwt.verify(refresh, SECRET) as Record<string, unknown>

    expect(Number(decodedRefresh.exp)).toBeGreaterThan(Number(decodedAccess.exp))
  })
})

describe('verifyToken', () => {
  it('decodes a valid access token', () => {
    const token = signAccessToken({ userId: 'u1', role: 'OWNER' })
    const payload = verifyToken<{ userId: string; role: string }>(token)
    expect(payload.userId).toBe('u1')
    expect(payload.role).toBe('OWNER')
  })

  it('throws JsonWebTokenError on an invalid token', () => {
    expect(() => verifyToken('not.a.valid.token')).toThrow()
  })

  it('throws JsonWebTokenError on a token signed with a different secret', () => {
    const badToken = jwt.sign({ userId: 'u1' }, 'wrong-secret')
    expect(() => verifyToken(badToken)).toThrow()
  })

  it('throws TokenExpiredError on an expired token', () => {
    const expired = jwt.sign({ userId: 'u1' }, SECRET, { expiresIn: -1 })
    expect(() => verifyToken(expired)).toThrow(jwt.TokenExpiredError)
  })

  it('throws when JWT_SECRET is missing', () => {
    const original = process.env.JWT_SECRET
    delete process.env.JWT_SECRET

    expect(() => signAccessToken({ userId: 'u1', role: 'OWNER' })).toThrow('JWT_SECRET is required')

    process.env.JWT_SECRET = original
  })
})
