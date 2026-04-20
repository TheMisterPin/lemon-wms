import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { describe, expect, it } from 'vitest'

import { signAccessToken } from '@/lib/auth/jwt'
import {
  getBearerToken,
  isFloorRole,
  isOfficeRole,
  unauthorizedJson,
  verifyAccessTokenFromRequest
} from '@/lib/auth/middleware'

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest('http://localhost/api/test', { headers })
}

describe('getBearerToken', () => {
  it('extracts token from a valid Authorization header', () => {
    const req = makeRequest({ authorization: 'Bearer my-token-123' })
    expect(getBearerToken(req)).toBe('my-token-123')
  })

  it('returns null when Authorization header is missing', () => {
    const req = makeRequest()
    expect(getBearerToken(req)).toBeNull()
  })

  it('returns null when Authorization uses a non-Bearer scheme', () => {
    const req = makeRequest({ authorization: 'Basic dXNlcjpwYXNz' })
    expect(getBearerToken(req)).toBeNull()
  })

  it('returns null for a Bearer header with no token value', () => {
    // Next.js trims header values — "Bearer " is normalized so startsWith fails
    const req = makeRequest({ authorization: 'Bearer ' })
    expect(getBearerToken(req)).toBeNull()
  })
})

describe('verifyAccessTokenFromRequest', () => {
  it('returns the decoded payload for a valid Bearer token', () => {
    const token = signAccessToken({ userId: 'u1', role: 'OWNER' })
    const req = makeRequest({ authorization: `Bearer ${token}` })

    const payload = verifyAccessTokenFromRequest(req)
    expect(payload).not.toBeNull()
    expect(payload?.userId).toBe('u1')
    expect(payload?.role).toBe('OWNER')
  })

  it('returns null when no Authorization header is present', () => {
    const req = makeRequest()
    expect(verifyAccessTokenFromRequest(req)).toBeNull()
  })

  it('returns null for an invalid/tampered token', () => {
    const req = makeRequest({ authorization: 'Bearer tampered.token.value' })
    expect(verifyAccessTokenFromRequest(req)).toBeNull()
  })

  it('falls back to the access_token cookie when the Bearer token is invalid', () => {
    const req = makeRequest({ authorization: 'Bearer tampered.token.value' })
    req.cookies.set('access_token', signAccessToken({ userId: 'u2', role: 'OWNER' }))

    const payload = verifyAccessTokenFromRequest(req)
    expect(payload).not.toBeNull()
    expect(payload?.userId).toBe('u2')
  })

  it('falls back to the access_token cookie when the Bearer token is expired', () => {
    const expired = jwt.sign(
      { userId: 'u1', role: 'OWNER' },
      process.env.JWT_SECRET!,
      { expiresIn: -1 }
    )
    const req = makeRequest({ authorization: `Bearer ${expired}` })
    req.cookies.set('access_token', signAccessToken({ userId: 'u3', role: 'OWNER' }))

    const payload = verifyAccessTokenFromRequest(req)
    expect(payload).not.toBeNull()
    expect(payload?.userId).toBe('u3')
  })

  it('returns null for an expired token', () => {
    const expired = jwt.sign(
      { userId: 'u1', role: 'OWNER' },
      process.env.JWT_SECRET!,
      { expiresIn: -1 }
    )
    const req = makeRequest({ authorization: `Bearer ${expired}` })
    expect(verifyAccessTokenFromRequest(req)).toBeNull()
  })
})

describe('isOfficeRole', () => {
  it.each(['OWNER', 'OFFICE_MANAGER', 'OFFICE_WORKER'] as const)(
    'returns true for %s',
    (role) => {
      expect(isOfficeRole(role)).toBe(true)
    }
  )

  it.each(['WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER'] as const)(
    'returns false for %s',
    (role) => {
      expect(isOfficeRole(role)).toBe(false)
    }
  )
})

describe('isFloorRole', () => {
  it.each(['OWNER', 'WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER'] as const)(
    'returns true for %s',
    (role) => {
      expect(isFloorRole(role)).toBe(true)
    }
  )

  it.each(['OFFICE_MANAGER', 'OFFICE_WORKER'] as const)(
    'returns false for %s',
    (role) => {
      expect(isFloorRole(role)).toBe(false)
    }
  )
})

describe('unauthorizedJson', () => {
  it('returns a 401 JSON response with error message', async () => {
    const response = unauthorizedJson()
    expect(response.status).toBe(401)

    const body = await response.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })
})
