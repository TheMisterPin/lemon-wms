import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import type { Role } from '@/generated/prisma'
import { verifyToken, type AccessTokenPayload } from '@/lib/auth/jwt'

const OFFICE_ROLES: Role[] = ['OWNER', 'OFFICE_MANAGER', 'OFFICE_WORKER']
const FLOOR_ROLES: Role[] = ['WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER']

export const getBearerToken = (request: NextRequest): string | null => {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

export const verifyAccessTokenFromRequest = (
  request: NextRequest,
): AccessTokenPayload | null => {
  const token = getBearerToken(request)
  if (!token) {
    return null
  }

  try {
    return verifyToken<AccessTokenPayload>(token)
  } catch {
    return null
  }
}

export const isOfficeRole = (role: Role): boolean => OFFICE_ROLES.includes(role)
export const isFloorRole = (role: Role): boolean => FLOOR_ROLES.includes(role)

export const unauthorizedJson = () =>
  NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
