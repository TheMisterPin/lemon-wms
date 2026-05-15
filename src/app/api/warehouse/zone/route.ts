import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, forbidden, ok, unauthorized, validationFail } from '@/lib/api/response'
import type { AccessTokenPayload } from '@/lib/auth/jwt'
import { isFloorRole, verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { switchFloorZone } from '@/lib/iam/switch-floor-zone'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'

const switchZoneBodySchema = z.object({
  zoneId: z.string().trim().min(1)
})

type FloorDeviceContext = {
  deviceId: string
  warehouseId: string
}

async function resolveFloorDeviceContext(payload: AccessTokenPayload): Promise<FloorDeviceContext | null> {
  if (payload.deviceId && payload.warehouseId) {
    return {
      deviceId: payload.deviceId,
      warehouseId: payload.warehouseId
    }
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
    select: { id: true, warehouseId: true }
  })

  if (!device?.warehouseId) {
    return null
  }

  return {
    deviceId: device.id,
    warehouseId: device.warehouseId
  }
}

/**
 * POST /api/warehouse/zone — move the logged-in device to another zone and scope the user.
 */
export async function POST(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isFloorRole(payload.role)) {
    return forbidden('Floor session required.')
  }

  const raw = await req.json().catch(() => null)
  const parsed = switchZoneBodySchema.safeParse(raw)
  if (!parsed.success) {
    return validationFail(parsed.error)
  }

  try {
    const context = await resolveFloorDeviceContext(payload)
    if (!context) {
      return fail('Device and warehouse context are required.', 'BAD_REQUEST', 400)
    }

    const result = await switchFloorZone({
      prisma,
      userId: payload.userId,
      role: payload.role,
      deviceId: context.deviceId,
      warehouseId: context.warehouseId,
      nextZoneId: parsed.data.zoneId
    })

    return ok(result, 'Zone updated.')
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }
    logAppError('[POST /api/warehouse/zone]', error)

    return fail('Failed to switch zone.')
  }
}
