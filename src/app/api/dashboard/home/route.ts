import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getWarehouseHomeData } from '@/lib/entities/warehouses/get-warehouse-home-data'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  try {
    const data = await getWarehouseHomeData(prisma)
    return ok(data, 'Warehouses retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/home]', error)
    return fail('Failed to retrieve warehouses.')
  }
}
