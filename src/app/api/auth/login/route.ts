import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'

import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  createDeviceLabel,
  persistRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import prisma from '@/lib/prisma'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  if (!user.isActive) {
    // Write LOGIN_FAILED UAE for deactivated account
    await prisma.userActivityEntry.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN_FAILED',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined,
        notes: 'Account deactivated'
      }
    })

    return NextResponse.json({ error: 'Account deactivated' }, { status: 403 })
  }

  if (!user.passwordHash || (user.loginType !== 'CREDENTIAL' && user.loginType !== 'BOTH')) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const matches = await bcrypt.compare(password, user.passwordHash)
  if (!matches) {
    // Write LOGIN_FAILED UAE for wrong password
    await prisma.userActivityEntry.create({
      data: {
        userId: user.id,
        actionType: 'LOGIN_FAILED',
        entityType: 'USER',
        entityId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined,
        notes: 'Invalid password'
      }
    })

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const accessToken = signAccessToken({ userId: user.id, role: user.role })
  const refreshToken = signRefreshToken({ userId: user.id })

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await persistRefreshToken({
    userId: user.id,
    rawToken: refreshToken,
    deviceLabel: createDeviceLabel(request.headers.get('user-agent')),
    expiresAt
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
        ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
      }
    })
  ])

  return NextResponse.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      badgeNumber: user.badgeNumber
    }
  })
}
