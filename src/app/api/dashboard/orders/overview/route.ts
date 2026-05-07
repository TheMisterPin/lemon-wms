import type { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { isOfficeRole, verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getOrdersDashboardData } from '@/lib/pages/dashboard/get-orders-dashboard-data'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return unauthorized()
  }

  try {
    const data = await getOrdersDashboardData(prisma)

    return ok(data, 'Orders dashboard retrieved successfully.')
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    logAppError('[GET /api/dashboard/orders/overview]', error)

    return fail('Failed to load orders dashboard.')
  }
}
