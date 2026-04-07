import bcrypt from 'bcrypt'

import type { PrismaClient } from '@/generated/prisma'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  createDeviceLabel,
  persistRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import { DomainError } from '@/lib/errors'

type CredentialLoginParams = {
  email: string
  password: string
  ipAddress?: string
  userAgent?: string
}

type CredentialLoginResult = {
  accessToken: string
  user: {
    id: string
    email: string | null
    role: string
    fullName: string | null
    badgeNumber: string
  }
}

export async function credentialLogin(
  prisma: PrismaClient,
  params: CredentialLoginParams
): Promise<CredentialLoginResult> {
  const { email, password, ipAddress, userAgent } = params

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw new DomainError('Invalid email or password', 'UNAUTHORIZED', 401)
  }

  if (!user.isActive) {
    await prisma.userActivityEntry.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN_FAILED',
        entityType: 'USER',
        entityId: user.id,
        ipAddress,
        notes: 'Account deactivated'
      }
    })
    throw new DomainError('Account deactivated', 'FORBIDDEN', 403)
  }

  if (!user.passwordHash || (user.loginType !== 'CREDENTIAL' && user.loginType !== 'BOTH')) {
    throw new DomainError('Invalid email or password', 'UNAUTHORIZED', 401)
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    await prisma.userActivityEntry.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN_FAILED',
        entityType: 'USER',
        entityId: user.id,
        ipAddress,
        notes: 'Invalid password'
      }
    })
    throw new DomainError('Invalid email or password', 'UNAUTHORIZED', 401)
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
    prisma.userActivityEntry.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        ipAddress
      }
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
