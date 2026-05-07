import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'

export type VerifyTokenResult =
  | { valid: true; userId: string; role: string; error?: undefined }
  | { valid: false; userId?: undefined; role?: undefined; error?: string }

function getSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is required')
  }

  return secret
}

/**
 * Soft JWT verification for clients/tests — returns an envelope instead of throwing.
 * Prefer `@/lib/auth/jwt` `verifyToken` on server routes where failures must abort the request.
 */
export async function verifyToken(token: string): Promise<VerifyTokenResult> {
  if (!token) {
    return { valid: false }
  }

  try {
    const payload = jwt.verify(token, getSecret()) as { userId?: unknown; role?: unknown }
    if (typeof payload.userId !== 'string' || typeof payload.role !== 'string') {
      return { valid: false, error: 'Invalid token' }
    }

    return { valid: true, userId: payload.userId, role: payload.role }
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { valid: false, error: 'Token expired' }
    }
    if (error instanceof JsonWebTokenError) {
      return { valid: false, error: 'Invalid token' }
    }

    throw error
  }
}
