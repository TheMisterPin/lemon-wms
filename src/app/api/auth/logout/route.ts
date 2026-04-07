import { NextRequest, NextResponse } from 'next/server'

import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { readRefreshTokenCookie } from '@/lib/auth/session'
import { logout } from '@/lib/entities/auth/logout'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const rawRefreshToken = await readRefreshTokenCookie()
  const payload = verifyAccessTokenFromRequest(request)

  await logout(prisma, {
    rawRefreshToken,
    userId: payload?.userId ?? null,
    ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
  })

  return NextResponse.json({ success: true })
}
