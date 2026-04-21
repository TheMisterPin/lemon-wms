import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { logAppError } from '@/lib/logs/app-logger'
import { getAllVendors } from '@/lib/parties/business-parties'
import prisma from '@/lib/prisma'

/**
 * @swagger
 * /api/dashboard/business-parties:
 *   get:
 *     summary: GET /api/dashboard/business-parties
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
    const vendors = await getAllVendors(prisma)

    return ok(vendors, 'Vendors retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/dashboard/business-parties]', error)

    return fail('Failed to retrieve vendors.')
  }
}
