import jwt from 'jsonwebtoken'

import type { Role } from '@/generated/prisma'

const JWT_SECRET = process.env.JWT_SECRET
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY ?? '15m'
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? '7d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required')
}

export type AccessTokenPayload = {
  userId: string
  role: Role
  deviceId?: string
  zoneId?: string
  warehouseId?: string
}

export type RefreshTokenPayload = {
  userId: string
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY })
}

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRY })
}

export const verifyToken = <T>(token: string): T => {
  return jwt.verify(token, JWT_SECRET) as T
}
