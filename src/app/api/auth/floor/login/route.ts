import { NextRequest, NextResponse } from 'next/server'

import bcrypt from 'bcrypt'
import { z } from 'zod'

import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  persistRefreshToken,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import prisma from '@/lib/prisma'

const loginSchema = z.object({
  deviceCode: z.string().min(3),
  badgeNumber: z.string().min(3),
  pin: z.string().regex(/^\d{4}$/)
})

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const device = await prisma.device.findUnique({
    where: { code: parsed.data.deviceCode },
    include: { zone: true }
  })

  if (!device || !device.isActive) {
    return NextResponse.json({ error: 'Invalid device code' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({ where: { badgeNumber: parsed.data.badgeNumber } })

  if (!user || !user.pinHash || !user.isActive) {
    return NextResponse.json({ error: 'Invalid badge or PIN' }, { status: 401 })
  }

  const matches = await bcrypt.compare(parsed.data.pin, user.pinHash)
  if (!matches) {
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
  await setRefreshTokenCookie(refreshToken)

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
