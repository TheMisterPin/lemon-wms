import type { NextRequest } from 'next/server'

import { fail, notFound, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getCategoryStockDashboardData } from '@/lib/pages/dashboard/get-category-stock-dashboard-data'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  const url = new URL(req.url)
  const categoryId = url.searchParams.get('categoryId')?.trim() || undefined

  try {
    const data = await getCategoryStockDashboardData(prisma, categoryId)

    return ok(data, 'Category stock dashboard retrieved successfully.')
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === 'NOT_FOUND') {
        return notFound('Category')
      }

      return fail(error.message, error.code, error.status)
    }

    logAppError('[GET /api/dashboard/stock/categories/overview]', error)

    return fail('Failed to load category stock dashboard.')
  }
}
