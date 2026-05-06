import { NextRequest } from 'next/server'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { releasePurchaseOrder } from '@/lib/orders/purchase'
import { createPurchaseOrderReceipt } from '@/lib/orders/receipt/create-reciept-order'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ orderType: string; id: string }> }

/**
 * @swagger
 * /api/dashboard/orders/{orderType}/{id}/release:
 *   post:
 *     summary: POST /api/dashboard/orders/{orderType}/{id}/release
 *     tags: [Dashboard]
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

  if (!isOfficeRole(payload.role)) {
    return forbidden('Only office users can release purchase orders.')
  }

  const { orderType, id: rawId } = await params
  if (orderType !== 'purchase') {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  const id = rawId?.trim()
  if (!id) {
    return fail('Purchase order id is required.', 'VALIDATION_ERROR', 400)
  }

  try {
    const data = await releasePurchaseOrder(prisma, id, payload.userId)
    const attachedRecieptOrder = await createPurchaseOrderReceipt(prisma, id)
    if (!attachedRecieptOrder.success) {
      return fail(attachedRecieptOrder.message, attachedRecieptOrder.code, 400)
    }

    return ok({ ...data, ...attachedRecieptOrder.receiptOrder }, 'Purchase order released successfully.')
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    logAppError('[POST /api/dashboard/orders/[orderType]/[id]/release]', error)

    return fail('Failed to release purchase order.')
  }
}
