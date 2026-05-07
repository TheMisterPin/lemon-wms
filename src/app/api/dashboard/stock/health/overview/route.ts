import type { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { logAppError } from '@/lib/logs/app-logger'
import { getInventoryHealthDashboardData } from '@/lib/pages/dashboard/get-inventory-health-dashboard-data'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  try {
    const data = await getInventoryHealthDashboardData(prisma)

    return ok(data, 'Inventory health dashboard retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/dashboard/stock/health/overview]', error)

    return fail('Failed to load inventory health dashboard.')
  }
}
