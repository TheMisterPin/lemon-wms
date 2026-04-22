import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { logAppError } from '@/lib/logs/app-logger'
import { getLocationsHomeData } from '@/lib/pages/dashboard/dashboard-locations-page-data'
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
    const data = await getLocationsHomeData(prisma)

    return ok(data, 'Locations retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/dashboard/home]', error)

    return fail('Failed to retrieve warehouses.')
  }
}
