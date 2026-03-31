import jwt from 'jsonwebtoken'
import { describe, expect, it } from 'vitest'

import { verifyToken } from '@/utils/auth/verify-token'
import { signAccessToken } from '@/lib/auth/jwt'

const SECRET = 'test-secret-for-unit-tests-at-least-32-chars'

describe('verifyToken', () => {
  it('returns valid:true with userId and role for a valid token', async () => {
    const token = signAccessToken({ userId: 'u1', role: 'OWNER' })
    const result = await verifyToken(token)

    expect(result.valid).toBe(true)
    expect(result.userId).toBe('u1')
    expect(result.role).toBe('OWNER')
    expect(result.error).toBeUndefined()
  })

  it('includes floor-specific roles correctly', async () => {
    const token = signAccessToken({ userId: 'u2', role: 'WAREHOUSE_WORKER' })
    const result = await verifyToken(token)

    expect(result.valid).toBe(true)
    expect(result.role).toBe('WAREHOUSE_WORKER')
  })

  it('returns valid:false with "Token expired" for an expired token', async () => {
    const expired = jwt.sign({ userId: 'u1', role: 'OWNER' }, SECRET, { expiresIn: -1 })
    const result = await verifyToken(expired)

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Token expired')
    expect(result.userId).toBeUndefined()
  })

  it('returns valid:false with "Invalid token" for a malformed token', async () => {
    const result = await verifyToken('this.is.garbage')

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid token')
  })

  it('returns valid:false for a token signed with a different secret', async () => {
    const bad = jwt.sign({ userId: 'u1', role: 'OWNER' }, 'wrong-secret')
    const result = await verifyToken(bad)

    expect(result.valid).toBe(false)
    expect(result.error).toBe('Invalid token')
  })

  it('returns valid:false for an empty string', async () => {
    const result = await verifyToken('')

    expect(result.valid).toBe(false)
  })
})
