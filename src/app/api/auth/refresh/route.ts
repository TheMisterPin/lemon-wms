import { NextResponse } from 'next/server'

import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  findValidRefreshToken,
  persistRefreshToken,
  readRefreshTokenCookie,
  revokeRefreshToken,
  setRefreshTokenCookie
} from '@/lib/auth/session'

export async function POST() {
  const rawRefreshToken = await readRefreshTokenCookie()

  if (!rawRefreshToken) {
    return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 })
  }

  const existing = await findValidRefreshToken(rawRefreshToken)
  if (!existing || !existing.user.isActive) {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }

  await revokeRefreshToken(existing.id)

  const accessToken = signAccessToken({
    userId: existing.user.id,
    role: existing.user.role
  })
  const nextRefresh = signRefreshToken({ userId: existing.user.id })

  await persistRefreshToken({
    userId: existing.user.id,
    rawToken: nextRefresh,
    deviceLabel: existing.deviceLabel,
    deviceId: existing.deviceId ?? undefined,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })
  await setRefreshTokenCookie(nextRefresh)

  return NextResponse.json({ accessToken })
}
