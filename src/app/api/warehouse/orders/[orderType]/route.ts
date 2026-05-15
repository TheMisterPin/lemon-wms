import { NextRequest } from 'next/server'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { getWarehousePurchaseOrders } from '@/lib/orders/purchase'
import { getWarehouseSalesOrders } from '@/lib/orders/sales/get-warehouse-sales-orders'
import type { WarehouseOperationalOrderListRow } from '@/lib/orders/shared/warehouse-operational-order-list-row'
import { parseWarehouseOperationalOrderKind } from '@/lib/orders/shared/warehouse-operational-route-kind'
import { getWarehouseTransferOrders } from '@/lib/orders/transfer/get-warehouse-transfer-orders'
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
    return forbidden('Only warehouse users can list operational orders.')
  }

  const { orderType: rawOrderType } = await params
  const kind = parseWarehouseOperationalOrderKind(rawOrderType)
  if (!kind) {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  if (!payload.warehouseId) {
    return fail('Warehouse context is required.', 'VALIDATION_ERROR', 400)
  }

  let rows: WarehouseOperationalOrderListRow[]
  let message: string

  if (kind === 'purchase') {
    rows = await getWarehousePurchaseOrders(prisma, payload.warehouseId)
    message = 'Purchase orders retrieved successfully.'
  } else if (kind === 'sales') {
    rows = await getWarehouseSalesOrders(prisma, payload.warehouseId)
    message = 'Sales orders retrieved successfully.'
  } else {
    rows = await getWarehouseTransferOrders(prisma, payload.warehouseId)
    message = 'Transfer orders retrieved successfully.'
  }

  return ok(rows, message)
}
