import jwt from 'jsonwebtoken'

import {
  verifyToken as verifyJwtToken,
  type AccessTokenPayload,
} from '@/lib/auth/jwt'

export interface TokenValidationResult {
  valid: boolean
  userId?: string
  role?: AccessTokenPayload['role']
  error?: string
}

export async function verifyToken(token: string): Promise<TokenValidationResult> {
  try {
    const decoded = verifyJwtToken<AccessTokenPayload>(token)

    return {
      valid: true,
      userId: decoded.userId,
      role: decoded.role,
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' }
    }

    return { valid: false, error: 'Invalid token' }
  }
}
