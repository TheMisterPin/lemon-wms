import type { NextRequest } from 'next/server'

import type { PrismaClient } from '@/generated/prisma'
import type { AccessTokenPayload } from '@/lib/auth/jwt'

export type FloorDeviceContext = {
  deviceId: string
  warehouseId: string
  zoneId: string | null
}

async function getLastLoginDeviceId(prisma: PrismaClient, userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastLoginDeviceId: true }
  })

  return user?.lastLoginDeviceId ?? null
}

export async function resolveFloorDeviceContext(
  prisma: PrismaClient,
  req: NextRequest,
  payload: AccessTokenPayload
): Promise<FloorDeviceContext | null> {
  const headerDeviceId = req.headers.get('x-device-id')?.trim() || null
  const deviceId = payload.deviceId
    ?? headerDeviceId
    ?? await getLastLoginDeviceId(prisma, payload.userId)

  if (!deviceId) {
    return null
  }

  const device = await prisma.device.findFirst({
    where: {
      id: deviceId,
      authorized: true,
      isActive: true
    },
    select: {
      id: true,
      warehouseId: true,
      zoneId: true
    }
  })

  if (!device?.warehouseId) {
    return null
  }

  if (payload.warehouseId && payload.warehouseId !== device.warehouseId) {
    return null
  }

  return {
    deviceId: device.id,
    warehouseId: payload.warehouseId ?? device.warehouseId,
    zoneId: payload.zoneId ?? device.zoneId
  }
}
