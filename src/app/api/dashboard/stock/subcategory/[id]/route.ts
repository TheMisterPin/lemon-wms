import type { NextRequest } from 'next/server'

import { fail, notFound, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getSubcategoryStockDashboardData } from '@/lib/pages/dashboard/get-subcategory-stock-dashboard-data'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(_req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can view the stock dashboard.', 'FORBIDDEN', 403)
  }

  const { id } = await params
  const code = decodeURIComponent(id).trim()

  if (code === '') {
    return fail('Subcategory code is required.', 'VALIDATION_FAILED', 400)
  }

  try {
    const data = await getSubcategoryStockDashboardData(prisma, code)

    return ok(data, 'Subcategory stock dashboard retrieved successfully.')
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === 'NOT_FOUND') {
        return notFound('Category')
      }

      return fail(error.message, error.code, error.status)
    }

    logAppError('[GET /api/dashboard/stock/subcategory/[id]]', error)

    return fail('Failed to load subcategory stock dashboard.')
  }
}
