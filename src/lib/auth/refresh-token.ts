import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  findValidRefreshToken,
  persistRefreshToken,
  revokeRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import { DomainError } from '@/lib/errors'
import prisma from '@/lib/prisma'

type RefreshTokenResult = {
  accessToken: string
  user: {
    id: string
    email: string | null
    role: string
    badgeNumber: string
  }
}

async function resolveFloorDeviceClaimsForRefresh(params: {
  userId: string
  refreshDeviceId: string | null
}): Promise<{ deviceId?: string; warehouseId?: string; zoneId?: string }> {
  let deviceId = params.refreshDeviceId ?? undefined

  if (!deviceId) {
    const userRow = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { lastLoginDeviceId: true }
    })
    deviceId = userRow?.lastLoginDeviceId ?? undefined
  }

  if (!deviceId) {
    return {}
  }

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { warehouseId: true, zoneId: true }
  })

  if (!device?.warehouseId) {
    return { deviceId }
  }

  return {
    deviceId,
    warehouseId: device.warehouseId,
    zoneId: device.zoneId ?? undefined
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

  const floorClaims = await resolveFloorDeviceClaimsForRefresh({
    userId: existing.user.id,
    refreshDeviceId: existing.deviceId
  })

  await revokeRefreshToken(existing.id)

  const accessToken = signAccessToken({
    userId: existing.user.id,
    role: existing.user.role,
    ...floorClaims
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
