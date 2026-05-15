import type { PrismaClient, Role } from '@/generated/prisma'

import { signAccessToken } from '@/lib/auth/jwt'
import { setAccessTokenCookie } from '@/lib/auth/session'
import { DomainError } from '@/lib/errors'

const FLOOR_ROLES: Role[] = ['OWNER', 'WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER']

export type SwitchFloorZoneParams = {
  prisma: PrismaClient
  userId: string
  role: Role
  deviceId: string
  warehouseId: string
  nextZoneId: string
}

export type SwitchFloorZoneResult = {
  accessToken: string
  user: {
    id: string
    fullName: string
    email: string | null
    role: Role
    badgeNumber: string
  }
  location: {
    warehouseId: string
    zoneId: string
  }
  device: {
    id: string
    name: string
    code: string
    warehouseId: string
    zoneId: string
  }
}

/**
 * Moves the floor device to another zone, records a warehouse assignment for the user,
 * reissues the access token, and refreshes the httpOnly access cookie.
 */
export async function switchFloorZone(params: SwitchFloorZoneParams): Promise<SwitchFloorZoneResult> {
  const { prisma, userId, role, deviceId, warehouseId, nextZoneId } = params

  if (!FLOOR_ROLES.includes(role)) {
    throw new DomainError('Only floor users can change zone context.', 'FORBIDDEN', 403)
  }

  if (!deviceId || !warehouseId) {
    throw new DomainError('Missing device or warehouse in session.', 'UNAUTHORIZED', 401)
  }

  const [device, zone, user] = await Promise.all([
    prisma.device.findFirst({
      where: { id: deviceId },
      select: { id: true, name: true, code: true, warehouseId: true, zoneId: true, authorized: true, isActive: true }
    }),
    prisma.zone.findFirst({
      where: { id: nextZoneId, warehouseId, deletedAt: null, isActive: true },
      select: { id: true, warehouseId: true }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, role: true, badgeNumber: true }
    })
  ])

  if (!device || !device.authorized || !device.isActive) {
    throw new DomainError('Device not available.', 'FORBIDDEN', 403)
  }

  if (!device.warehouseId || device.warehouseId !== warehouseId) {
    throw new DomainError('Device does not belong to this warehouse.', 'FORBIDDEN', 403)
  }

  if (!zone) {
    throw new DomainError('Zone not found in this warehouse.', 'NOT_FOUND', 404)
  }

  if (!user) {
    throw new DomainError('User not found.', 'NOT_FOUND', 404)
  }

  const updatedDevice = await prisma.$transaction(async (tx) => {
    await tx.device.update({
      where: { id: device.id },
      data: { zoneId: nextZoneId }
    })

    await tx.warehouseAssignment.upsert({
      where: {
        userId_warehouseId_zoneId: {
          userId,
          warehouseId,
          zoneId: nextZoneId
        }
      },
      create: {
        userId,
        warehouseId,
        zoneId: nextZoneId
      },
      update: {}
    })

    return tx.device.findUniqueOrThrow({
      where: { id: device.id },
      select: { id: true, name: true, code: true, warehouseId: true, zoneId: true }
    })
  })

  if (!updatedDevice.warehouseId || !updatedDevice.zoneId) {
    throw new DomainError('Zone switch produced an invalid device state.', 'SERVER_ERROR', 500)
  }

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    deviceId: updatedDevice.id,
    warehouseId: updatedDevice.warehouseId,
    zoneId: updatedDevice.zoneId
  })

  await setAccessTokenCookie(accessToken)

  return {
    accessToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      badgeNumber: user.badgeNumber
    },
    location: {
      warehouseId: updatedDevice.warehouseId,
      zoneId: updatedDevice.zoneId
    },
    device: {
      id: updatedDevice.id,
      name: updatedDevice.name,
      code: updatedDevice.code,
      warehouseId: updatedDevice.warehouseId,
      zoneId: updatedDevice.zoneId
    }
  }
}
