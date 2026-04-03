import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getWarehouseHomePageData } from '@/lib/components/pages/warehouse-home-page-data'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  try {
    const data = await getWarehouseHomePageData(prisma)

    return ok(data, 'Warehouses retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/warehouse]', error)

    return fail('Failed to retrieve warehouses.')
  }
}
