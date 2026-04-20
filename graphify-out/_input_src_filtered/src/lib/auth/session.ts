import crypto from 'node:crypto'

import { cookies } from 'next/headers'

import prisma from '@/lib/prisma'

const REFRESH_COOKIE_NAME = 'refresh_token'
const ACCESS_COOKIE_NAME = 'access_token'

/**
 * hashToken.
 * @param token - Parameter for hashToken.
 * @returns Result from hashToken.
 */
const hashToken = (token: string): string =>
  crypto.createHash('sha256').update(token).digest('hex')

/**
 * setRefreshTokenCookie.
 * @param token - Parameter for setRefreshTokenCookie.
 * @returns Result from setRefreshTokenCookie.
 */
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

/**
 * clearRefreshTokenCookie.
 * @returns Result from clearRefreshTokenCookie.
 */
export const clearRefreshTokenCookie = async (): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.delete(REFRESH_COOKIE_NAME)
}

/**
 * readRefreshTokenCookie.
 * @returns Result from readRefreshTokenCookie.
 */
export const readRefreshTokenCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies()

  return cookieStore.get(REFRESH_COOKIE_NAME)?.value ?? null
}

// Access token cookie — non-httpOnly so middleware (Edge) can read it
// Cleared on logout; re-set on login and refresh
/**
 * setAccessTokenCookie.
 * @param token - Parameter for setAccessTokenCookie.
 * @returns Result from setAccessTokenCookie.
 */
export const setAccessTokenCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set(ACCESS_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days — cookie persists; JWT itself expires in 15m
  })
}

/**
 * clearAccessTokenCookie.
 * @returns Result from clearAccessTokenCookie.
 */
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

/**
 * findValidRefreshToken.
 * @param rawToken - Parameter for findValidRefreshToken.
 * @returns Result from findValidRefreshToken.
 */
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

/**
 * revokeRefreshToken.
 * @param id - Parameter for revokeRefreshToken.
 * @returns Result from revokeRefreshToken.
 */
export const revokeRefreshToken = async (id: string): Promise<void> => {
  await prisma.refreshToken.update({
    where: { id },
    data: { revokedAt: new Date() }
  })
}

/**
 * revokeRefreshTokensForUser.
 * @param userId - Parameter for revokeRefreshTokensForUser.
 * @returns Result from revokeRefreshTokensForUser.
 */
export const revokeRefreshTokensForUser = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() }
  })
}

/**
 * createDeviceLabel.
 * @param userAgent - Parameter for createDeviceLabel.
 * @returns Result from createDeviceLabel.
 */
export const createDeviceLabel = (userAgent: string | null): string => {
  if (!userAgent) {
    return 'unknown-device'
  }

  return crypto.createHash('sha256').update(userAgent).digest('hex').slice(0, 12)
}
