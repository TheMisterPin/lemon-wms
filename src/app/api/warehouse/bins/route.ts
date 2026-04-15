import { NextRequest, NextResponse } from 'next/server'

import { unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'

/**
 * @swagger
 * /api/warehouse/bins:
 *   get:
 *     summary: GET /api/warehouse/bins
 *     tags: [Warehouse]
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)

  if (!payload) {
    return unauthorized()
  }

  return NextResponse.json({
    success: true,
    user: payload // optional, useful for debugging / frontend
  })
}
