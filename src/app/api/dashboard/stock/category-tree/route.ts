import type { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { logAppError } from '@/lib/logs/app-logger'
import { getStockCategoryTree } from '@/lib/pages/dashboard/get-stock-category-tree'
import prisma from '@/lib/prisma'

export async function GET(_req: NextRequest): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(_req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can view stock navigation.', 'FORBIDDEN', 403)
  }

  try {
    const data = await getStockCategoryTree(prisma)

    return ok(data, 'Category tree retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/dashboard/stock/category-tree]', error)

    return fail('Failed to load category tree.')
  }
}
