import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  findValidRefreshToken,
  persistRefreshToken,
  revokeRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import { DomainError } from '@/lib/errors'

type RefreshTokenResult = {
  accessToken: string
  user: {
    id: string
    email: string | null
    role: string
    badgeNumber: string
  }
}

export async function refreshAccessToken(
  rawRefreshToken: string | null
): Promise<RefreshTokenResult> {
  if (!rawRefreshToken) {
    throw new DomainError('Missing refresh token', 'UNAUTHORIZED', 401)
  }

  const existing = await findValidRefreshToken(rawRefreshToken)
  if (!existing || !existing.user.isActive) {
    throw new DomainError('Invalid refresh token', 'UNAUTHORIZED', 401)
  }

  await revokeRefreshToken(existing.id)

  const accessToken = signAccessToken({
    userId: existing.user.id,
    role: existing.user.role
  })
  const nextRefresh = signRefreshToken({ userId: existing.user.id })

  await persistRefreshToken({
    userId: existing.user.id,
    rawToken: nextRefresh,
    deviceLabel: existing.deviceLabel,
    deviceId: existing.deviceId ?? undefined,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })

  await Promise.all([
    setRefreshTokenCookie(nextRefresh),
    setAccessTokenCookie(accessToken)
  ])

  return {
    accessToken,
    user: {
      id: existing.user.id,
      email: existing.user.email,
      role: existing.user.role,
      badgeNumber: existing.user.badgeNumber
    }
  }
}
