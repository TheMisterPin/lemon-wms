import { NextRequest } from 'next/server'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { startPurchaseOrder } from '@/lib/orders/purchase'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ orderType: string; id: string }> }

/**
 * @swagger
 * /api/warehouse/orders/{orderType}/{id}/start:
 *   post:
 *     summary: POST /api/warehouse/orders/{orderType}/{id}/start
 *     tags: [Warehouse]
 *     parameters:
 *       - in: path
 *         name: orderType
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(_req: NextRequest, { params }: RouteParams) {
  const payload = verifyAccessTokenFromRequest(_req)
  if (!payload) {
    return unauthorized()
  }

  if (!isFloorRole(payload.role)) {
    return forbidden('Only warehouse users can start purchase orders.')
  }

  const { orderType, id: rawId } = await params
  if (orderType !== 'purchase') {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  const id = rawId?.trim()
  if (!id) {
    return fail('Purchase order id is required.', 'VALIDATION_ERROR', 400)
  }

  if (!payload.warehouseId) {
    return fail('Warehouse context is required.', 'VALIDATION_ERROR', 400)
  }

  try {
    const data = await startPurchaseOrder(prisma, id, payload.warehouseId)

    return ok(data, 'Purchase order execution started.')
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    console.error('[POST /api/warehouse/orders/[orderType]/[id]/start]', error)

    return fail('Failed to start purchase order.')
  }
}
