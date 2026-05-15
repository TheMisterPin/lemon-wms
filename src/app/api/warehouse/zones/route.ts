import type { NextRequest } from 'next/server'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import type { AccessTokenPayload } from '@/lib/auth/jwt'
import { isFloorRole, verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { listActiveZonesForWarehouse } from '@/lib/locations/zones/zones-queries'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'

async function resolveWarehouseId(payload: AccessTokenPayload): Promise<string | null> {
  if (payload.warehouseId) {
    return payload.warehouseId
  }

  const deviceId = payload.deviceId
    ?? (await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { lastLoginDeviceId: true }
    }))?.lastLoginDeviceId

  if (!deviceId) {
    return null
  }

  const device = await prisma.device.findUnique({
    where: { id: deviceId },
    select: { warehouseId: true }
  })

  return device?.warehouseId ?? null
}

/**
 * GET /api/warehouse/zones — active zones for the warehouse in the current JWT.
 */
export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isFloorRole(payload.role)) {
    return forbidden('Floor session required.')
  }

  try {
    const warehouseId = await resolveWarehouseId(payload)
    if (!warehouseId) {
      return fail('Warehouse context missing from session.', 'BAD_REQUEST', 400)
    }

    const zones = await listActiveZonesForWarehouse(prisma, warehouseId)

    return ok({ zones }, 'Zones loaded.')
  } catch (error) {
    logAppError('[GET /api/warehouse/zones]', error)

    return fail('Failed to load zones.')
  }
}
