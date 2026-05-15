import { NextRequest } from 'next/server'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { resumePurchaseOrder } from '@/lib/orders/purchase'
import { resumeSalesOrder } from '@/lib/orders/shared/transition-sales-order'
import { resumeTransferOrder } from '@/lib/orders/shared/transition-transfer-order'
import { parseWarehouseOperationalOrderKind } from '@/lib/orders/shared/warehouse-operational-route-kind'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ orderType: string; id: string }> }

/**
 * @swagger
 * /api/warehouse/orders/{orderType}/{id}/resume:
 *   post:
 *     summary: POST /api/warehouse/orders/{orderType}/{id}/resume
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
    return forbidden('Only warehouse users can resume orders.')
  }

  const { orderType: rawOrderType, id: rawId } = await params
  const kind = parseWarehouseOperationalOrderKind(rawOrderType)
  if (!kind) {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  const id = rawId?.trim()
  if (!id) {
    return fail('Order id is required.', 'VALIDATION_ERROR', 400)
  }

  if (!payload.warehouseId) {
    return fail('Warehouse context is required.', 'VALIDATION_ERROR', 400)
  }

  try {
    const data =
      kind === 'purchase'
        ? await resumePurchaseOrder(prisma, id, payload.warehouseId, payload.userId, payload.zoneId ?? null)
        : kind === 'sales'
          ? await resumeSalesOrder(prisma, id, payload.warehouseId, payload.userId, payload.zoneId ?? null)
          : await resumeTransferOrder(prisma, id, payload.warehouseId, payload.userId, payload.zoneId ?? null)

    return ok(data, 'Order resumed.')
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    logAppError('[POST /api/warehouse/orders/[orderType]/[id]/resume]', error)

    return fail('Failed to resume order.')
  }
}
