import jwt from 'jsonwebtoken'

import prisma from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface TokenPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

export interface TokenValidationResult {
  valid: boolean
  userId?: string
  email?: string
  error?: string
}

/**
 * Verifies JWT token and checks if it exists in database
 * Returns user info if valid, error if invalid
 */
export async function verifyToken(token: string): Promise<TokenValidationResult> {
  try {
    // Step 1: Verify JWT signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload

    // Step 2: Check if token exists in database (not revoked)
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session) {
      return { valid: false, error: 'Token not found or revoked' }
    }

    // Step 3: Check if token is expired (database-level check)
    if (session.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.session.delete({ where: { id: session.id } })
      return { valid: false, error: 'Token expired' }
    }

    // Step 4: Update last used timestamp
    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    })

    return {
      valid: true,
      userId: decoded.userId,
      email: decoded.email,
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token' }
    }
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token expired' }
    }
    return { valid: false, error: 'Token verification failed' }
  }
}

/**
 * Clean up expired tokens (can be run as cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
  return result.count
}
