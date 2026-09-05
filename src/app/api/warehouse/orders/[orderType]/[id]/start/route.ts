import { NextRequest } from 'next/server'
import { z } from 'zod'

import { withIdempotency } from '@/lib/api/idempotency'
import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { ActiveOrderConflictDomainError } from '@/lib/orders/shared/active-order-conflict-error'
import { startOperationalOrderForFloorUser } from '@/lib/orders/shared/start-operational-order-for-floor-user'
import { parseWarehouseOperationalOrderKind } from '@/lib/orders/shared/warehouse-operational-route-kind'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ orderType: string; id: string }> }

const startBodySchema = z.object({
  forcePauseOthers: z.boolean().optional()
})

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
export async function POST(req: NextRequest, { params }: RouteParams) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isFloorRole(payload.role)) {
    return forbidden('Only warehouse users can start orders.')
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

  const rawBody = await req.json().catch(() => null)
  const parsedBody = startBodySchema.safeParse(rawBody ?? {})
  if (!parsedBody.success) {
    return fail('Invalid request body.', 'VALIDATION_ERROR', 400)
  }

  const idempotencyKey = req.headers.get('Idempotency-Key')?.trim()
  if (!idempotencyKey) {
    return fail('Idempotency-Key header is required.', 'IDEMPOTENCY_KEY_REQUIRED', 400)
  }

  const warehouseId = payload.warehouseId

  return withIdempotency(
    prisma,
    { scope: `${kind}:start:${id}`, idempotencyKey, body: parsedBody.data, userId: payload.userId },
    async () => {
      try {
        const data = await startOperationalOrderForFloorUser(prisma, {
          kind,
          orderId: id,
          warehouseId,
          userId: payload.userId,
          zoneId: payload.zoneId ?? null,
          forcePauseOthers: parsedBody.data.forcePauseOthers === true
        })

        return ok(data, 'Order execution started.')
      } catch (error) {
        if (error instanceof ActiveOrderConflictDomainError) {
          return fail(error.message, error.code, error.status, {
            conflictingOrders: error.conflictingOrders
          })
        }

        if (error instanceof DomainError) {
          return fail(error.message, error.code, error.status)
        }

        logAppError('[POST /api/warehouse/orders/[orderType]/[id]/start]', error)

        return fail('Failed to start order.')
      }
    }
  )
}
