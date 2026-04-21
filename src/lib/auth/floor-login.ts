import bcrypt from 'bcrypt'

import type { PrismaClient } from '@/generated/prisma'
import { LoginType } from '@/generated/prisma/edge'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  persistRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import { DomainError } from '@/lib/errors'
import { upsertDevice } from '@/lib/iam'
import {
  AUTH_LOG_FAILURE_REASONS,
  AUTH_LOG_METHODS,
  createUserActivityEntry,
  LOG_ACTION_TYPES
} from '@/lib/logs'

type FloorLoginParams = {
  deviceCode: string
  badgeNumber: string
  pin: string
  ipAddress?: string
}

type FloorLoginResult = {
  accessToken: string
  user: {
    id: string
    role: string
    badgeNumber: string
  }
  location: {
    warehouseId?: string
    zoneId?: string
  }
  device: {
    id: string
    name: string
    code: string
    warehouseId?: string
    zoneId?: string
  }
}

export async function floorLogin(
  prisma: PrismaClient,
  params: FloorLoginParams
): Promise<FloorLoginResult> {
  const { deviceCode, badgeNumber, pin, ipAddress } = params

  const device = await upsertDevice(prisma, deviceCode)

  if (!device) {
    throw new DomainError('Unable to register device.', 'SERVER_ERROR', 500)
  }

  if (!device.authorized) {
    throw new DomainError('Device not authorized. Authorize it from the Dashboard.', 'UNAUTHORIZED', 401)
  }

  if (!device.isActive) {
    throw new DomainError('Device is inactive.', 'UNAUTHORIZED', 401)
  }

  const user = await prisma.user.findUnique({ where: { badgeNumber } })

  if (!user) {
    throw new DomainError('User not found', 'NOT_FOUND', 404)
  }

  if (!user.isActive) {
    await createUserActivityEntry({
      prisma,
      userId: user.id,
      actionType: LOG_ACTION_TYPES.LOGIN_FAILED,
      entityType: 'USER',
      entityId: user.id,
      warehouseId: device.warehouseId ?? undefined,
      ipAddress,
      metadata: {
        method: AUTH_LOG_METHODS.BADGE_PIN,
        reason: AUTH_LOG_FAILURE_REASONS.USER_INACTIVE
      },
      notes: 'Account deactivated'
    })
    throw new DomainError('Account deactivated', 'FORBIDDEN', 403)
  }

  if (user.loginType !== LoginType.BADGE_PIN && user.loginType !== LoginType.BOTH) {
    throw new DomainError('Invalid login type', 'UNAUTHORIZED', 401)
  }

  if (!user.pinHash) {
    throw new DomainError('Missing PIN', 'UNAUTHORIZED', 401)
  }

  const matches = await bcrypt.compare(pin, user.pinHash)
  if (!matches) {
    await createUserActivityEntry({
      prisma,
      userId: user.id,
      actionType: LOG_ACTION_TYPES.LOGIN_FAILED,
      entityType: 'USER',
      entityId: user.id,
      warehouseId: device.warehouseId ?? undefined,
      ipAddress,
      metadata: {
        method: AUTH_LOG_METHODS.BADGE_PIN,
        reason: AUTH_LOG_FAILURE_REASONS.INVALID_PIN
      },
      notes: 'Invalid PIN'
    })
    throw new DomainError('Wrong PIN', 'UNAUTHORIZED', 401)
  }

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    deviceId: device.id,
    warehouseId: device.warehouseId ?? undefined,
    zoneId: device.zoneId ?? undefined
  })

  const refreshToken = signRefreshToken({ userId: user.id })

  await persistRefreshToken({
    userId: user.id,
    rawToken: refreshToken,
    deviceLabel: `${device.name}:${device.code}`,
    deviceId: device.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })

  await Promise.all([
    setRefreshTokenCookie(refreshToken),
    setAccessTokenCookie(accessToken),
    prisma.user.update({
      where: { id: user.id },
      data: { lastLoginDeviceId: device.id }
    }),
    createUserActivityEntry({
      prisma,
      userId: user.id,
      actionType: LOG_ACTION_TYPES.LOGIN,
      entityType: 'USER',
      entityId: user.id,
      warehouseId: device.warehouseId ?? undefined,
      ipAddress,
      metadata: {
        method: AUTH_LOG_METHODS.BADGE_PIN
      }
    })
  ])

  return {
    accessToken,
    user: {
      id: user.id,
      role: user.role,
      badgeNumber: user.badgeNumber
    },
    location: {
      warehouseId: device.warehouseId ?? undefined,
      zoneId: device.zoneId ?? undefined
    },
    device: {
      id: device.id,
      name: device.name,
      code: device.code,
      warehouseId: device.warehouseId ?? undefined,
      zoneId: device.zoneId ?? undefined
    }
  }
}
