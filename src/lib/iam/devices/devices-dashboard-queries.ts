import type { PrismaClient } from '@/generated/prisma'

export type DevicesDashboardFilters = {
  warehouseId?: string
  authorizationStatus?: 'AUTHORIZED' | 'PENDING' | 'REJECTED'
  onlineStatus?: 'ACTIVE' | 'IDLE' | 'OFFLINE'
  assignedUserId?: string
}

const ACTIVE_ASSIGNMENT_STATES = ['ASSIGNED', 'STARTED', 'RESUMED', 'PAUSED'] as const

function buildDeviceWhere(filters?: DevicesDashboardFilters) {
  if (!filters) {
    return undefined
  }

  return {
    ...(filters.warehouseId ? { warehouseId: filters.warehouseId } : {}),
    ...(filters.authorizationStatus ? { authorizationStatus: filters.authorizationStatus } : {}),
    ...(filters.onlineStatus ? { onlineStatus: filters.onlineStatus } : {}),
    ...(filters.assignedUserId ? { lastUserId: filters.assignedUserId } : {})
  }
}

function buildTrolleyWhere(filters?: DevicesDashboardFilters) {
  if (!filters) {
    return undefined
  }

  return {
    ...(filters.warehouseId ? { warehouseId: filters.warehouseId } : {}),
    ...(filters.assignedUserId ? { currentUserId: filters.assignedUserId } : {})
  }
}

async function getDevicesDashboardRecords(prisma: PrismaClient, filters?: DevicesDashboardFilters) {
  return prisma.device.findMany({
    where: buildDeviceWhere(filters),
    select: {
      id: true,
      code: true,
      name: true,
      warehouseId: true,
      warehouse: { select: { name: true } },
      lastUser: { select: { id: true, fullName: true } },
      authorized: true,
      authorizationStatus: true,
      onlineStatus: true,
      lastSeenAt: true,
      trolley: {
        select: {
          id: true,
          code: true
        }
      },
      orderAssignments: {
        where: {
          status: { in: [...ACTIVE_ASSIGNMENT_STATES] },
          isActive: true
        },
        orderBy: [{ startedAt: 'desc' }, { assignedAt: 'desc' }],
        take: 1,
        select: {
          orderId: true,
          orderType: true
        }
      }
    },
    orderBy: [{ onlineStatus: 'asc' }, { lastSeenAt: 'desc' }, { registeredAt: 'desc' }]
  })
}

async function getTrolleyDashboardRecords(prisma: PrismaClient, filters?: DevicesDashboardFilters) {
  return prisma.trolley.findMany({
    where: buildTrolleyWhere(filters),
    select: {
      id: true,
      code: true,
      warehouse: { select: { name: true } },
      currentDevice: { select: { code: true } },
      currentUser: { select: { fullName: true } },
      _count: {
        select: {
          transitBinStockItems: true,
          orderAssignments: true
        }
      }
    },
    orderBy: [{ lastSeenAt: 'desc' }, { createdAt: 'desc' }]
  })
}

async function getDeviceDetailRecord(prisma: PrismaClient, deviceId: string) {
  return prisma.device.findFirst({
    where: { id: deviceId },
    select: {
      id: true,
      name: true,
      code: true,
      authorized: true,
      authorizationStatus: true,
      onlineStatus: true,
      errorCount: true,
      lastSeenAt: true,
      lastHeartbeatAt: true,
      warehouseId: true,
      warehouse: { select: { name: true } },
      lastUser: { select: { id: true, fullName: true } },
      orderAssignments: {
        where: {
          status: { in: [...ACTIVE_ASSIGNMENT_STATES] }
        },
        orderBy: [{ startedAt: 'desc' }, { assignedAt: 'desc' }],
        take: 3,
        select: {
          orderId: true,
          orderType: true,
          status: true,
          startedAt: true,
          assignedAt: true,
          userId: true,
          user: { select: { id: true, fullName: true } }
        }
      },
      userActivityEntries: {
        orderBy: { createdAt: 'desc' },
        take: 25,
        select: {
          id: true,
          actionType: true,
          entityType: true,
          entityId: true,
          warehouseId: true,
          notes: true,
          createdAt: true,
          userId: true,
          user: { select: { id: true, fullName: true } },
          warehouse: { select: { name: true } }
        }
      },
      _count: {
        select: {
          deviceSessions: true,
          orderAssignments: true,
          userActivityEntries: true
        }
      }
    }
  })
}

export { ACTIVE_ASSIGNMENT_STATES, getDeviceDetailRecord, getDevicesDashboardRecords, getTrolleyDashboardRecords }
