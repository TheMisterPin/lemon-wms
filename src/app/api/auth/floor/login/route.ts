import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'

import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  persistRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import { upsertDevice } from '@/lib/entities/devices/create-device'
import prisma from '@/lib/prisma'

const loginSchema = z.object({
  deviceCode: z.string().min(1),
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

  // Upsert device — creates it if unknown, otherwise finds existing
  const device = await upsertDevice(prisma, deviceCode)

  if (!device) {
    return NextResponse.json({ error: 'Unable to register device.' }, { status: 500 })
  }

  if (!device.authorized) {
    return NextResponse.json(
      { error: 'Device not authorized. Authorize it from the Dashboard.' },
      { status: 401 }
    )
  }

  if (!device.isActive) {
    return NextResponse.json({ error: 'Device is inactive.' }, { status: 401 })
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
        warehouseId: device.warehouseId ?? undefined,
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
        warehouseId: device.warehouseId ?? undefined,
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
    prisma.userActivityEntry.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        warehouseId: device.warehouseId ?? undefined,
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
  })
}
