import { NextRequest } from 'next/server'

import { fail, forbidden, notFound, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getActiveReceiptForPurchaseOrder } from '@/lib/orders/purchase/receipt/receipt-order-queries'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ orderType: string; id: string }> }

/**
 * @swagger
 * /api/warehouse/orders/{orderType}/{id}/receipt:
 *   get:
 *     summary: GET /api/warehouse/orders/{orderType}/{id}/receipt
 *     tags: [Warehouse]
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const payload = verifyAccessTokenFromRequest(_req)
  if (!payload) {
    return unauthorized()
  }

  if (!isFloorRole(payload.role)) {
    return forbidden('Only warehouse users can access receipts.')
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
    const receipt = await getActiveReceiptForPurchaseOrder(prisma, id, payload.warehouseId)

    if (!receipt) {
      return notFound('Receipt')
    }

    return ok(receipt, 'Receipt retrieved.')
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    logAppError('[GET /api/warehouse/orders/[orderType]/[id]/receipt]', error)

    return fail('Failed to retrieve receipt.')
  }
}
