import jwt, { type SignOptions } from 'jsonwebtoken'

import type { Role } from '@/generated/prisma'

const JWT_ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY ?? '15m') as SignOptions['expiresIn']
const JWT_REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY ?? '7d') as SignOptions['expiresIn']

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is required')
  }

  return secret
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
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_ACCESS_EXPIRY })
}

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, getSecret(), { expiresIn: JWT_REFRESH_EXPIRY })
}

export const verifyToken = <T>(token: string): T => {
  return jwt.verify(token, getSecret()) as T
}
