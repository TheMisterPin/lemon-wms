import { NextRequest } from 'next/server'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { isOfficeRole, verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getOrderTypeDashboardData } from '@/lib/pages/dashboard/get-order-type-dashboard-data'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ orderType: string }> }

/**
 * @swagger
 * /api/dashboard/orders/{orderType}:
 *   get:
 *     summary: GET /api/dashboard/orders/{orderType}
 *     tags: [Dashboard]
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
export async function GET(req: NextRequest, { params }: RouteParams): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return forbidden('Only office users can access order dashboards.')
  }

  const { orderType } = await params

  try {
    const data = await getOrderTypeDashboardData(prisma, orderType)

    return ok(data, 'Order type dashboard retrieved successfully.')
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === 'VALIDATION_ERROR') {
        return fail(error.message, error.code, 400)
      }

      return fail(error.message, error.code, error.status)
    }

    logAppError('[GET /api/dashboard/orders/[orderType]]', error)

    return fail('Failed to retrieve order dashboard.')
  }
}
