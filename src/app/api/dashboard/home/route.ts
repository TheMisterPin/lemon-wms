import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getWarehouseHomeData } from '@/lib/locations'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/dashboard/home:
 *   get:
 *     summary: GET /api/dashboard/home
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  try {
    const data = await getWarehouseHomeData(prisma)

    return ok(data, 'Warehouses retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/home]', error)

    return fail('Failed to retrieve warehouses.')
  }
}
