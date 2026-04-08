import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { getStockDashboard } from '@/lib/entities/stock/get-stock-dashboard'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can view the stock list.', 'FORBIDDEN', 403)
  }

  try {
    const warehouseId = prisma.warehouse.findFirst({
      where: {
        id: 'WH-0001'
      }
    })
    if (!warehouseId) {
      return fail('Warehouse ID is required.', 'BAD_REQUEST', 400)
    }
    const stock = await getStockDashboard(prisma, 'WH-0001')

    return ok(stock, 'Stock retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/stock]', error)

    return fail('Failed to retrieve stock.')
  }
}
