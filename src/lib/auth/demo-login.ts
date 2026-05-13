import { Role, type PrismaClient } from '@/generated/prisma'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import {
  createDeviceLabel,
  persistRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie
} from '@/lib/auth/session'
import { DomainError } from '@/lib/errors'
import { AUTH_LOG_METHODS, createUserActivityEntry, LOG_ACTION_TYPES } from '@/lib/logs'
import { syncTodaysBinHistorySnapshotsAfterLogin } from '@/lib/logs/bin-history/bin-history-helpers'

export type DemoLoginSurface = 'dashboard' | 'warehouse'

const DASHBOARD_DEMO_ROLES: Role[] = [Role.OWNER, Role.OFFICE_MANAGER, Role.OFFICE_WORKER]

const WAREHOUSE_DEMO_ROLES: Role[] = [Role.OWNER, Role.WAREHOUSE_MANAGER, Role.WAREHOUSE_WORKER]

type DemoLoginParams = {
  role: Role
  surface: DemoLoginSurface
  ipAddress?: string
  userAgent?: string
}

type DemoLoginResult = {
  accessToken: string
  user: {
    id: string
    email: string | null
    role: string
    fullName: string
    badgeNumber: string
  }
  location?: {
    warehouseId?: string
    zoneId?: string
  }
  device?: {
    id: string
    name: string
    code: string
    warehouseId?: string
    zoneId?: string
  }
}

function assertDemoSurfaceForRole(surface: DemoLoginSurface, role: Role): void {
  const allowed = surface === 'dashboard' ? DASHBOARD_DEMO_ROLES : WAREHOUSE_DEMO_ROLES
  if (!allowed.includes(role)) {
    throw new DomainError('This demo role is not available for the selected login.', 'VALIDATION_ERROR', 400)
  }
}

export async function demoLogin(
  prisma: PrismaClient,
  params: DemoLoginParams
): Promise<DemoLoginResult> {
  const { role, surface, ipAddress, userAgent } = params

  assertDemoSurfaceForRole(surface, role)

  const user = await prisma.user.findFirst({
    where: {
      role,
      isActive: true,
      deletedAt: null
    },
    orderBy: { id: 'asc' }
  })

  if (!user) {
    throw new DomainError('No user found for that role.', 'NOT_FOUND', 404)
  }

  let device:
    | {
        id: string
        name: string
        code: string
        warehouseId: string | null
        zoneId: string | null
      }
    | null = null

  if (surface === 'warehouse') {
    device = await prisma.device.findFirst({
      where: {
        lastUserId: user.id,
        authorized: true,
        isActive: true,
        warehouseId: { not: null }
      },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
        warehouseId: true,
        zoneId: true
      }
    })

    if (!device) {
      throw new DomainError(
        'No authorized seeded device is linked to this user. Run db seed (demo devices).',
        'NOT_FOUND',
        404
      )
    }
  }

  const accessToken = signAccessToken(
    device
      ? {
          userId: user.id,
          role: user.role,
          deviceId: device.id,
          warehouseId: device.warehouseId ?? undefined,
          zoneId: device.zoneId ?? undefined
        }
      : { userId: user.id, role: user.role }
  )
  const refreshToken = signRefreshToken({ userId: user.id })

  await persistRefreshToken({
    userId: user.id,
    rawToken: refreshToken,
    deviceLabel: device
      ? `${device.name}:${device.code}`
      : createDeviceLabel(userAgent ?? null),
    deviceId: device?.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  })

  await Promise.all([
    setRefreshTokenCookie(refreshToken),
    setAccessTokenCookie(accessToken),
    createUserActivityEntry({
      prisma,
      userId: user.id,
      actionType: LOG_ACTION_TYPES.LOGIN,
      entityType: 'USER',
      entityId: user.id,
      warehouseId: device?.warehouseId ?? undefined,
      zoneId: device?.zoneId ?? undefined,
      ipAddress,
      metadata: {
        method: AUTH_LOG_METHODS.DEMO
      },
      notes: 'Demo mode instant login'
    })
  ])

  await syncTodaysBinHistorySnapshotsAfterLogin(prisma)

  const base = {
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      badgeNumber: user.badgeNumber
    }
  }

  if (device) {
    return {
      ...base,
      location: {
        warehouseId: device.warehouseId ?? undefined,
        zoneId: device.zoneId ?? undefined
      },
      device: {
        id: device.id,
        name: device.name,
        code: device.code,
        warehouseId: device.warehouseId ?? undefined,
        zoneId: device.zoneId ?? undefined
      }
    }
  }

  return base
}
