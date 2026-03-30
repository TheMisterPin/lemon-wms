import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'

import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  persistRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import prisma from '@/lib/prisma'

const loginSchema = z.object({
  deviceCode: z.string().min(3),
  badgeNumber: z.string().min(3),
  pin: z.string().regex(/^\d{4}$/)
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { deviceCode, badgeNumber, pin } = parsed.data
  const ipAddress =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined

  const device = await prisma.device.findUnique({
    where: { code: deviceCode },
    include: { zone: true }
  })

  if (!device || !device.isActive) {
    return NextResponse.json({ error: 'Invalid device code' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { badgeNumber } })

  if (!user) {
    return NextResponse.json({ error: 'Invalid badge or PIN' }, { status: 401 })
  }

  if (!user.isActive) {
    await prisma.userActivityEntry.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN_FAILED',
        entityType: 'USER',
        entityId: user.id,
        warehouseId: device.warehouseId,
        ipAddress,
        notes: 'Account deactivated'
      }
    })

    return NextResponse.json({ error: 'Account deactivated' }, { status: 403 })
  }

  if (!user.pinHash || (user.loginType !== 'BADGE_PIN' && user.loginType !== 'BOTH')) {
    return NextResponse.json({ error: 'Invalid badge or PIN' }, { status: 401 })
  }

  const matches = await bcrypt.compare(pin, user.pinHash)
  if (!matches) {
    await prisma.userActivityEntry.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN_FAILED',
        entityType: 'USER',
        entityId: user.id,
        warehouseId: device.warehouseId,
        ipAddress,
        notes: 'Invalid PIN'
      }
    })

    return NextResponse.json({ error: 'Invalid badge or PIN' }, { status: 401 })
  }

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    deviceId: device.id,
    warehouseId: device.warehouseId,
    zoneId: device.zoneId
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
    prisma.userActivityEntry.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        warehouseId: device.warehouseId,
        ipAddress
      }
    })
  ])

  return NextResponse.json({
    accessToken,
    user: {
      id: user.id,
      role: user.role,
      badgeNumber: user.badgeNumber
    },
    device: {
      id: device.id,
      warehouseId: device.warehouseId,
      zoneId: device.zoneId
    }
  })
}
