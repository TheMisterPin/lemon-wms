import { NextRequest } from 'next/server'

import { verifyToken } from './verify-token'

export interface AuthResult {
	valid: boolean
	userId?: string
	email?: string
	error?: string
}

export async function getAuthFromRequest(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'No token provided' }
  }

  const token = authHeader.substring(7)
  const validation = await verifyToken(token)

  if (!validation.valid) {
    return { valid: false, error: validation.error || 'Invalid token' }
  }

  return {
    valid: true,
    userId: validation.userId,
    email: validation.email,
  }
}
