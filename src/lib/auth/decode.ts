import type { JWTPayload } from '@/types'

/**
 * Client-safe JWT decoder — base64 only, no signature verification.
 * Use server-side `verifyToken()` from jwt.ts whenever signature validation is required.
 */
export function decodeAccessToken(token: string): JWTPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return null
    }

    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    const payload = JSON.parse(atob(padded)) as JWTPayload

    if (!payload.userId || !payload.role) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

/**
 * Returns the token if it is present and not expired, otherwise null.
 */
export function getUsableAccessToken(token: string | null): string | null {
  if (!token) return null
  const payload = decodeAccessToken(token)
  if (!payload) return null
  if (payload.exp && payload.exp * 1000 <= Date.now()) return null
  return token
}
