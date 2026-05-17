import { NextRequest } from 'next/server'

import { fail, forbidden, notFound, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getActivePickForSalesOrder } from '@/lib/orders/sales/sales-pick/sales-pick-queries'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ orderType: string; id: string }> }

/**
 * @swagger
 * /api/warehouse/orders/{orderType}/{id}/pick:
 *   get:
 *     summary: GET /api/warehouse/orders/{orderType}/{id}/pick
 *     tags: [Warehouse]
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const payload = verifyAccessTokenFromRequest(_req)
  if (!payload) {
    return unauthorized()
  }

  if (!isFloorRole(payload.role)) {
    return forbidden('Only warehouse users can access picks.')
  }

  const { orderType, id: rawId } = await params
  if (orderType !== 'sales') {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  const id = rawId?.trim()
  if (!id) {
    return fail('Sales order id is required.', 'VALIDATION_ERROR', 400)
  }

  if (!payload.warehouseId) {
    return fail('Warehouse context is required.', 'VALIDATION_ERROR', 400)
  }

  try {
    const pick = await getActivePickForSalesOrder(prisma, id, payload.warehouseId)

    if (!pick) {
      return notFound('Pick')
    }

    return ok(pick, 'Pick retrieved.')
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    logAppError('[GET /api/warehouse/orders/[orderType]/[id]/pick]', error)

    return fail('Failed to retrieve pick.')
  }
}
