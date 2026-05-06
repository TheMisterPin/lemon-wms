import type { PrismaClient, Role } from '@/generated/prisma'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  createDeviceLabel,
  persistRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import { DomainError } from '@/lib/errors'
import { AUTH_LOG_METHODS, createUserActivityEntry, LOG_ACTION_TYPES } from '@/lib/logs'

type DemoLoginParams = {
  role: Role
  ipAddress?: string
  userAgent?: string
}

type DemoLoginResult = {
  accessToken: string
  user: {
    id: string
    email: string | null
    role: string
    fullName: string
    badgeNumber: string
  }
}

export async function demoLogin(
  prisma: PrismaClient,
  params: DemoLoginParams
): Promise<DemoLoginResult> {
  const { role, ipAddress, userAgent } = params

  const user = await prisma.user.findFirst({
    where: {
      role,
      isActive: true,
      deletedAt: null
    },
    orderBy: { createdAt: 'asc' }
  })

  if (!user) {
    throw new DomainError('No user found for that role.', 'NOT_FOUND', 404)
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id })

  await persistRefreshToken({
    userId: user.id,
    rawToken: refreshToken,
    deviceLabel: createDeviceLabel(userAgent ?? null),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })

  await Promise.all([
    setRefreshTokenCookie(refreshToken),
    setAccessTokenCookie(accessToken),
    createUserActivityEntry({
      prisma,
      userId: user.id,
      actionType: LOG_ACTION_TYPES.LOGIN,
      entityType: 'USER',
      entityId: user.id,
      ipAddress,
      metadata: {
        method: AUTH_LOG_METHODS.DEMO
      },
      notes: 'Demo mode instant login'
    })
  ])

  return {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      badgeNumber: user.badgeNumber
    }
  }
}
