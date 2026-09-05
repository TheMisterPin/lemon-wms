import { NextRequest } from 'next/server'
import { z } from 'zod'

import { withIdempotency } from '@/lib/api/idempotency'
import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { completePurchaseOrderReceipt } from '@/lib/orders/purchase/receipt/complete-purchase-order-receipt'
import prisma from '@/lib/prisma'

const completeReceiptSchema = z.object({
  orderAssignmentId: z.string().min(1),
  notes: z.string().optional().nullable()
})

type RouteParams = {
  params: Promise<{ orderType: string; id: string; receiptId: string }>
}

/**
 * @swagger
 * /api/warehouse/orders/{orderType}/{id}/receipt/{receiptId}/complete:
 *   post:
 *     summary: Complete a purchase order receipt and mark the PO as executed
 *     tags: [Warehouse]
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isFloorRole(payload.role)) {
    return forbidden('Only warehouse users can complete receipts.')
  }

  const { orderType, id: rawId, receiptId } = await params

  if (orderType !== 'purchase') {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  const id = rawId?.trim()
  if (!id || !receiptId) {
    return fail('Purchase order id and receipt id are required.', 'VALIDATION_ERROR', 400)
  }

  if (!payload.warehouseId) {
    return fail('Warehouse context is required.', 'VALIDATION_ERROR', 400)
  }

  const body = await req.json().catch(() => null)
  const parsed = completeReceiptSchema.safeParse(body)
  if (!parsed.success) {
    return fail('Validation failed.', 'VALIDATION_ERROR', 400)
  }

  const idempotencyKey = req.headers.get('Idempotency-Key')?.trim()
  if (!idempotencyKey) {
    return fail('Idempotency-Key header is required.', 'IDEMPOTENCY_KEY_REQUIRED', 400)
  }

  const warehouseId = payload.warehouseId

  return withIdempotency(
    prisma,
    { scope: `receipt:complete:${receiptId}`, idempotencyKey, body: parsed.data, userId: payload.userId },
    async () => {
      try {
        const result = await completePurchaseOrderReceipt(prisma, {
          receiptId,
          purchaseOrderId: id,
          orderAssignmentId: parsed.data.orderAssignmentId,
          userId: payload.userId,
          warehouseId,
          notes: parsed.data.notes ?? null
        })

        if (!result.success) {
          return fail(result.error, result.code ?? 'DOMAIN_ERROR', 409)
        }

        return ok(result, 'Purchase order executed.')
      } catch (error) {
        if (error instanceof DomainError) {
          return fail(error.message, error.code, error.status)
        }

        logAppError('[POST /api/warehouse/orders/[orderType]/[id]/receipt/[receiptId]/complete]', error)

        return fail('Failed to complete receipt.')
      }
    }
  )
}
