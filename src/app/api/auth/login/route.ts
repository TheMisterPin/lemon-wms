import { NextRequest, NextResponse } from 'next/server'

import bcrypt from 'bcrypt'
import { z } from 'zod'

import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  createDeviceLabel,
  persistRefreshToken,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import prisma from '@/lib/prisma'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export async function POST(request: NextRequest) {
  const parsed = loginSchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })

  if (!user || !user.passwordHash || !user.isActive) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash)
  if (!matches) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
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
  await setRefreshTokenCookie(refreshToken)

  return NextResponse.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      badgeNumber: user.badgeNumber
    }
  })
}
