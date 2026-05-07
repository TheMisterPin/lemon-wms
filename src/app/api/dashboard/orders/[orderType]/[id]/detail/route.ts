import type { NextRequest } from 'next/server'

import { fail, notFound, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getOrderDetailDashboardData } from '@/lib/pages/dashboard/get-order-detail-dashboard-data'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ orderType: string; id: string }> }

export async function GET(req: NextRequest, { params }: Params): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  const { orderType, id } = await params

  try {
    const data = await getOrderDetailDashboardData(prisma, orderType, id)

    return ok(data, 'Order detail retrieved successfully.')
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === 'NOT_FOUND') {
        return notFound('Order')
      }

      return fail(error.message, error.code, error.status)
    }

    logAppError('[GET /api/dashboard/orders/[orderType]/[id]/detail]', error)

    return fail('Failed to load order detail dashboard.')
  }
}
