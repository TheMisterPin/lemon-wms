import { NextRequest } from 'next/server'

import { withIdempotency } from '@/lib/api/idempotency'
import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { pausePurchaseOrder } from '@/lib/orders/purchase'
import { pauseSalesOrder } from '@/lib/orders/shared/transition-sales-order'
import { pauseTransferOrder } from '@/lib/orders/shared/transition-transfer-order'
import { parseWarehouseOperationalOrderKind } from '@/lib/orders/shared/warehouse-operational-route-kind'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ orderType: string; id: string }> }

/**
 * @swagger
 * /api/warehouse/orders/{orderType}/{id}/pause:
 *   post:
 *     summary: POST /api/warehouse/orders/{orderType}/{id}/pause
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
    return forbidden('Only warehouse users can pause orders.')
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

  const idempotencyKey = _req.headers.get('Idempotency-Key')?.trim()
  if (!idempotencyKey) {
    return fail('Idempotency-Key header is required.', 'IDEMPOTENCY_KEY_REQUIRED', 400)
  }

  const warehouseId = payload.warehouseId

  return withIdempotency(
    prisma,
    { scope: `${kind}:pause:${id}`, idempotencyKey, body: {}, userId: payload.userId },
    async () => {
      try {
        const data =
          kind === 'purchase'
            ? await pausePurchaseOrder(prisma, id, warehouseId, payload.userId)
            : kind === 'sales'
              ? await pauseSalesOrder(prisma, id, warehouseId, payload.userId)
              : await pauseTransferOrder(prisma, id, warehouseId, payload.userId)

        return ok(data, 'Order paused.')
      } catch (error) {
        if (error instanceof DomainError) {
          return fail(error.message, error.code, error.status)
        }

        logAppError('[POST /api/warehouse/orders/[orderType]/[id]/pause]', error)

        return fail('Failed to pause order.')
      }
    }
  )
}
