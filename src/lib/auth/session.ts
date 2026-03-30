import crypto from 'node:crypto'

import { cookies } from 'next/headers'

import prisma from '@/lib/prisma'

const REFRESH_COOKIE_NAME = 'refresh_token'
const ACCESS_COOKIE_NAME = 'access_token'

const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex')

export const setRefreshTokenCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

export const clearRefreshTokenCookie = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete(REFRESH_COOKIE_NAME)
}

export const readRefreshTokenCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()

  return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null
}

// Access token cookie — non-httpOnly so middleware (Edge) can read it
// Cleared on logout; re-set on login and refresh
export const setAccessTokenCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set(ACCESS_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15 // 15 minutes, matches JWT_ACCESS_EXPIRY
  })
}

export const clearAccessTokenCookie = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete(ACCESS_COOKIE_NAME)
}

export const persistRefreshToken = async (params: {
  userId: string
  rawToken: string
  deviceLabel: string
  deviceId?: string
  expiresAt: Date
}): Promise<void> => {
  await prisma.refreshToken.create({
    data: {
      userId: params.userId,
      tokenHash: hashToken(params.rawToken),
      deviceLabel: params.deviceLabel,
      deviceId: params.deviceId,
      expiresAt: params.expiresAt
    }
  })
}

export const findValidRefreshToken = async (rawToken: string) => {
  return prisma.refreshToken.findFirst({
    where: {
      tokenHash: hashToken(rawToken),
      revokedAt: null,
      expiresAt: { gt: new Date() }
    },
    include: { user: true }
  })
}

export const revokeRefreshToken = async (id: string): Promise<void> => {
  await prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() }
  })
}

export const revokeRefreshTokensForUser = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  })
}

export const createDeviceLabel = (userAgent: string | null): string => {
  if (!userAgent) {
    return 'unknown-device'
  }

  return crypto.createHash('sha256').update(userAgent).digest('hex').slice(0, 12)
}
