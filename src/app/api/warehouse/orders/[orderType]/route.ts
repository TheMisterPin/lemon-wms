import { NextRequest } from 'next/server'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { getWarehousePurchaseOrders } from '@/lib/orders/purchase'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ orderType: string }> }

/**
 * @swagger
 * /api/warehouse/orders/{orderType}:
 *   get:
 *     summary: GET /api/warehouse/orders/{orderType}
 *     tags: [Warehouse]
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

  if (!isFloorRole(payload.role)) {
    return forbidden('Only warehouse users can list operational purchase orders.')
  }

  const { orderType } = await params
  if (orderType !== 'purchase') {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  if (!payload.warehouseId) {
    return fail('Warehouse context is required.', 'VALIDATION_ERROR', 400)
  }

  const rows = await getWarehousePurchaseOrders(prisma, payload.warehouseId)

  return ok(rows, 'Purchase orders retrieved successfully.')
}
