import type { NextRequest } from 'next/server'

import { fail, notFound, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getWarehouseOverviewDashboardData } from '@/lib/pages/dashboard/get-warehouse-overview-dashboard-data'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  const { id } = await params

  try {
    const data = await getWarehouseOverviewDashboardData(prisma, id)

    return ok(data, 'Warehouse overview retrieved successfully.')
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === 'NOT_FOUND') {
        return notFound('Warehouse')
      }

      return fail(error.message, error.code, error.status)
    }

    logAppError('[GET /api/dashboard/warehouses/[id]/overview]', error)

    return fail('Failed to load warehouse overview.')
  }
}
