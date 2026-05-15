import {
  LoginType,
  Role,
  type Prisma,
  type PrismaClient
} from '@/generated/prisma'

type SeedUser = {
  id: string
  email: string | null
  badgeNumber: string
  loginType: LoginType
  role: Role
  isActive: boolean
}

type DeviceContext = {
  warehouseId: string | null
  zoneId: string | null
}

function buildTimestamp(daysAgo: number, hour: number, minute: number) {
  const date = new Date()

  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)

  return date
}

/**
 * Seeds believable auth activity (LOGIN, LOGIN_FAILED, LOGOUT, TOKEN_REVOKED)
 * for both office and floor login flows.
 *
 * Bin stock reservations and pick-line ↔ bin-stock links are owned by
 * `seed-sales-order` and `seed-transfer-orders`, not this module.
 */
export async function seedUserActivities(prisma: PrismaClient) {
  const [users, zones, devices] = await Promise.all([
    prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        email: true,
        badgeNumber: true,
        loginType: true,
        role: true,
        isActive: true
      }
    }),
    prisma.zone.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        warehouseId: true
      }
    }),
    prisma.device.findMany({
      where: { isActive: true, authorized: true },
      orderBy: { registeredAt: 'asc' },
      select: {
        warehouseId: true,
        zoneId: true
      }
    })
  ])

  if (users.length === 0) {
    return { count: 0 }
  }

  const rows: Prisma.UserActivityEntryCreateManyInput[] = []

  const floorDeviceContexts: DeviceContext[] = devices
    .map((device) => ({
      warehouseId: device.warehouseId,
      zoneId: device.zoneId
    }))
    .filter((ctx) => ctx.warehouseId !== null)

  const fallbackDeviceContexts: DeviceContext[] = zones.map((zone) => ({
    warehouseId: zone.warehouseId,
    zoneId: zone.id
  }))

  const deviceContexts = floorDeviceContexts.length > 0
    ? floorDeviceContexts
    : fallbackDeviceContexts

  const officeUsers = users.filter((user) =>
    user.loginType === LoginType.CREDENTIAL || user.loginType === LoginType.BOTH
  )

  const floorUsers = users.filter((user) =>
    user.loginType === LoginType.BADGE_PIN || user.loginType === LoginType.BOTH
  )

  const pushOfficeAuthTrail = (user: SeedUser, index: number) => {
    const day = (index % 12) + 1
    const ipBase = 20 + (index % 120)
    const hasFailure = index % 3 !== 0

    if (hasFailure) {
      rows.push({
        userId: user.id,
        actionType: 'LOGIN_FAILED',
        entityType: 'USER',
        entityId: user.id,
        metadata: {
          method: 'CREDENTIAL',
          reason: 'INVALID_PASSWORD',
          attemptedEmail: user.email
        },
        ipAddress: `10.10.1.${ipBase}`,
        notes: 'Invalid password',
        createdAt: buildTimestamp(day, 7, 30 + (index % 20))
      })
    }

    rows.push({
      userId: user.id,
      actionType: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      metadata: {
        method: 'CREDENTIAL'
      },
      ipAddress: `10.10.1.${ipBase}`,
      createdAt: buildTimestamp(day, 8, 5 + (index % 35))
    })

    rows.push({
      userId: user.id,
      actionType: 'LOGOUT',
      entityType: 'USER',
      entityId: user.id,
      ipAddress: `10.10.1.${ipBase}`,
      notes: 'User logged out from office session',
      createdAt: buildTimestamp(day, 17, 5 + (index % 40))
    })

    if (index % 5 === 0) {
      rows.push({
        userId: user.id,
        actionType: 'TOKEN_REVOKED',
        entityType: 'REFRESH_TOKEN',
        entityId: `TOKEN-${user.id}`,
        metadata: {
          reason: 'LOGOUT_ALL_SESSIONS',
          method: 'CREDENTIAL'
        },
        ipAddress: `10.10.1.${ipBase}`,
        notes: 'Refresh token revoked after explicit logout',
        createdAt: buildTimestamp(day, 17, 12 + (index % 30))
      })
    }
  }

  const pushFloorAuthTrail = (user: SeedUser, index: number) => {
    const day = (index % 10) + 1
    const ipBase = 50 + (index % 150)
    const device = deviceContexts[index % Math.max(deviceContexts.length, 1)]

    rows.push({
      userId: user.id,
      actionType: 'LOGIN_FAILED',
      entityType: 'USER',
      entityId: user.id,
      warehouseId: device?.warehouseId ?? undefined,
      zoneId: device?.zoneId ?? undefined,
      metadata: {
        method: 'BADGE_PIN',
        reason: 'INVALID_PIN',
        attemptedBadgeNumber: user.badgeNumber
      },
      ipAddress: `10.20.2.${ipBase}`,
      notes: 'Invalid PIN',
      createdAt: buildTimestamp(day, 5, 35 + (index % 15))
    })

    rows.push({
      userId: user.id,
      actionType: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      warehouseId: device?.warehouseId ?? undefined,
      zoneId: device?.zoneId ?? undefined,
      metadata: {
        method: 'BADGE_PIN'
      },
      ipAddress: `10.20.2.${ipBase}`,
      createdAt: buildTimestamp(day, 6, 2 + (index % 25))
    })

    rows.push({
      userId: user.id,
      actionType: 'LOGOUT',
      entityType: 'USER',
      entityId: user.id,
      warehouseId: device?.warehouseId ?? undefined,
      zoneId: device?.zoneId ?? undefined,
      ipAddress: `10.20.2.${ipBase}`,
      notes: 'End of floor shift',
      createdAt: buildTimestamp(day, 14, 40 + (index % 18))
    })
  }

  officeUsers.slice(0, 18).forEach((user, index) => {
    pushOfficeAuthTrail(user, index)
  })

  floorUsers.slice(0, 20).forEach((user, index) => {
    pushFloorAuthTrail(user, index)
  })

  if (rows.length === 0) {
    return { count: 0 }
  }

  await prisma.userActivityEntry.createMany({ data: rows })

  return { count: rows.length }
}
