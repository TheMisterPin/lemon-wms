import type { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { logAppError } from '@/lib/logs/app-logger'
import { getUsersDashboardData } from '@/lib/pages/dashboard/get-users-dashboard-data'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  const url = new URL(req.url)
  const warehouseId = url.searchParams.get('warehouseId')?.trim() || undefined

  try {
    const data = await getUsersDashboardData(prisma, warehouseId)

    return ok(data, 'Users dashboard retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/dashboard/users/overview]', error)

    return fail('Failed to load users dashboard.')
  }
}
