import type { NextRequest } from 'next/server'

import { z } from 'zod'

import { fail, notFound, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { getStockDashboard } from '@/lib/entities/stock/get-stock-dashboard'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'

function parseWarehouseId(url: URL): string | null {
  const raw = url.searchParams.get('warehouseId')
  if (raw === null || raw.trim() === '') {
    return null
  }

  const parsed = z.string().uuid().safeParse(raw.trim())

  return parsed.success ? parsed.data : null
}

/**
 * Office-only stock dashboard. Optional `warehouseId` query scopes to one warehouse;
 * omit for network-wide aggregates.
 *
 * @swagger
 * /api/dashboard/stock:
 *   get:
 *     summary: GET /api/dashboard/stock
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(req: NextRequest): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can view the stock dashboard.', 'FORBIDDEN', 403)
  }

  const url = new URL(req.url)
  const warehouseId = parseWarehouseId(url)

  if (url.searchParams.get('warehouseId') && warehouseId === null) {
    return fail('warehouseId must be a valid UUID when provided.', 'VALIDATION_FAILED', 400)
  }

  try {
    const stock = await getStockDashboard(prisma, warehouseId)

    return ok(stock, 'Stock dashboard retrieved successfully.')
  } catch (error) {
    if (error instanceof DomainError && error.code === 'NOT_FOUND') {
      return notFound('Warehouse')
    }

    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    logAppError('[GET /api/dashboard/stock]', error)

    return fail('Failed to retrieve stock dashboard.')
  }
}
