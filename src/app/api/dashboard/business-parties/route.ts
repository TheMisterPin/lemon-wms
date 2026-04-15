import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getAllVendors } from '@/lib/entities/business-parties'
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
    console.error('[GET /api/dashboard/business-parties]', error)

    return fail('Failed to retrieve vendors.')
  }
}
