import { NextResponse } from 'next/server'

import {
  clearRefreshTokenCookie,
  findValidRefreshToken,
  readRefreshTokenCookie,
  revokeRefreshToken
} from '@/lib/auth/session'

export async function POST() {
  const rawRefreshToken = await readRefreshTokenCookie()

  if (rawRefreshToken) {
    const token = await findValidRefreshToken(rawRefreshToken)
    if (token) {
      await revokeRefreshToken(token.id)
    }
  }

  await clearRefreshTokenCookie()

  return NextResponse.json({ success: true })
}
