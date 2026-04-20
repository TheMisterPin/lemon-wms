import { NextRequest } from 'next/server'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { getDashboardPurchaseOrders } from '@/lib/orders/purchase'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ orderType: string }> }

/**
 * @swagger
 * /api/dashboard/orders/{orderType}:
 *   get:
 *     summary: GET /api/dashboard/orders/{orderType}
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: orderType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return forbidden('Only office users can list purchase orders.')
  }

  const { orderType } = await params
  if (orderType !== 'purchase') {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  try {
    const rows = await getDashboardPurchaseOrders(prisma)

    return ok(rows, 'Purchase orders retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/orders/[orderType]]', error)

    return fail('Failed to retrieve purchase orders.')
  }
}
