import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getTrolleyItems } from '@/lib/entities/move-operations'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }
  if (!payload.warehouseId) {
    return fail('Warehouse context is required for transit.', 'BAD_REQUEST', 400)
  }
  if (!payload.deviceId) {
    return fail('Device context is required for transit.', 'BAD_REQUEST', 400)
  }

  try {
    const items = await getTrolleyItems(prisma, payload.warehouseId, payload.deviceId)

    return ok(
      { items },
      'Trolley items retrieved successfully.'
    )
  } catch (error) {
    console.error('[GET /api/warehouse/stock/trolley]', error)

    return fail('Failed to retrieve trolley items.')
  }
}
