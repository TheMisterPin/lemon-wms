import type { PrismaClient } from '@/generated/prisma'
import {
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
  findValidRefreshToken,
  revokeRefreshToken
} from '@/lib/auth/session'
import { createUserActivityEntry, LOG_ACTION_TYPES } from '@/lib/entities/logs'

type LogoutParams = {
  rawRefreshToken: string | null
  userId: string | null
  ipAddress?: string
}

export async function logout(
  prisma: PrismaClient,
  params: LogoutParams
): Promise<void> {
  const { rawRefreshToken, ipAddress } = params
  let resolvedUserId = params.userId

  if (rawRefreshToken) {
    const token = await findValidRefreshToken(rawRefreshToken)
    if (token) {
      resolvedUserId = token.userId
      await revokeRefreshToken(token.id)
    }
  }

  if (resolvedUserId) {
    await createUserActivityEntry({
      prisma,
      userId: resolvedUserId,
      actionType: LOG_ACTION_TYPES.LOGOUT,
      entityType: 'USER',
      entityId: resolvedUserId,
      ipAddress
    })
  }

  await Promise.all([
    clearRefreshTokenCookie(),
    clearAccessTokenCookie()
  ])
}
