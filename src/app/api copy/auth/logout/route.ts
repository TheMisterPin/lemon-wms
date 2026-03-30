import { NextRequest, NextResponse } from 'next/server'

import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import {
  clearAccessTokenCookie,
  clearRefreshTokenCookie,
  findValidRefreshToken,
  readRefreshTokenCookie,
  revokeRefreshToken
} from '@/lib/auth/session'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const rawRefreshToken = await readRefreshTokenCookie()

  let userId: string | null = null

  if (rawRefreshToken) {
    const token = await findValidRefreshToken(rawRefreshToken)
    if (token) {
      userId = token.userId
      await revokeRefreshToken(token.id)
    }
  }

  // Fallback: get userId from access token if refresh lookup failed
  if (!userId) {
    const payload = verifyAccessTokenFromRequest(request)
    if (payload) {
      userId = payload.userId
    }
  }

  if (userId) {
    await prisma.userActivityEntry.create({
      data: {
        userId,
        actionType: 'LOGOUT',
        entityType: 'USER',
        entityId: userId,
        ipAddress:
          request.headers.get('x-forwarded-for') ??
          request.headers.get('x-real-ip') ??
          undefined
      }
    })
  }

  await Promise.all([
    clearRefreshTokenCookie(),
    clearAccessTokenCookie()
  ])

  return NextResponse.json({ success: true })
}
