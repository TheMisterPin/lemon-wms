import { NextRequest, NextResponse } from 'next/server'

import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { readRefreshTokenCookie } from '@/lib/auth/session'
import { logout } from '@/lib/entities/auth/logout'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: POST /api/auth/logout
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successful response
 */
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
