import type { OrderType, PrismaClient } from '@/generated/prisma'

import type { DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type { UsersDashboardDTO } from '@/types/users-dashboard.types'

async function getOrderReference(prisma: PrismaClient, orderType: OrderType, orderId: string): Promise<string> {
  if (orderType === 'PURCHASE') {
    const order = await prisma.purchaseOrder.findFirst({ where: { id: orderId }, select: { reference: true } })

    return order?.reference ?? orderId
  }
  if (orderType === 'SALES') {
    const order = await prisma.salesOrder.findFirst({ where: { id: orderId }, select: { reference: true } })

    return order?.reference ?? orderId
  }
  if (orderType === 'TRANSFER') {
    const order = await prisma.transferOrder.findFirst({ where: { id: orderId }, select: { reference: true } })

    return order?.reference ?? orderId
  }
  if (orderType === 'RETURN') {
    const order = await prisma.returnOrder.findFirst({ where: { id: orderId }, select: { reference: true } })

    return order?.reference ?? orderId
  }

  const order = await prisma.adjustmentOrder.findFirst({ where: { id: orderId }, select: { reference: true } })

  return order?.reference ?? orderId
}

function deriveUserStatus(args: {
  isLoggedIn: boolean
  hasActiveOrder: boolean
  hasExceptionActivity: boolean
  lastActivityAt?: Date
}): 'ACTIVE' | 'IDLE' | 'LOGGED_OUT' | 'IN_EXCEPTION' {
  if (!args.isLoggedIn) {
    return 'LOGGED_OUT'
  }

  if (args.hasExceptionActivity) {
    return 'IN_EXCEPTION'
  }

  if (args.hasActiveOrder) {
    return 'ACTIVE'
  }

  if (!args.lastActivityAt) {
    return 'IDLE'
  }

  const ageMinutes = Math.round((Date.now() - args.lastActivityAt.getTime()) / 60000)

  return ageMinutes <= 15 ? 'ACTIVE' : 'IDLE'
}

export async function getUsersDashboardData(
  prisma: PrismaClient,
  warehouseId?: string
): Promise<UsersDashboardDTO> {
  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      ...(warehouseId
        ? {
          warehouseAssignments: {
            some: {
              warehouseId
            }
          }
        }
        : {})
    },
    select: {
      id: true,
      fullName: true,
      role: true,
      isLoggedIn: true,
      warehouseAssignments: {
        select: {
          warehouseId: true,
          warehouse: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      lastLoginDevice: { select: { code: true } },
      orderAssignments: {
        where: {
          isActive: true,
          status: { in: ['ASSIGNED', 'STARTED', 'PAUSED', 'RESUMED'] }
        },
        select: {
          orderId: true,
          orderType: true,
          status: true,
          assignedAt: true
        },
        orderBy: { assignedAt: 'desc' }
      },
      userActivityEntries: {
        select: {
          createdAt: true,
          actionType: true
        },
        orderBy: { createdAt: 'desc' },
        take: 25
      }
    }
  })

  const userRows = await Promise.all(users.map(async (user) => {
    const warehouse = user.warehouseAssignments[0]
    const lastActivity = user.userActivityEntries[0]
    const activeAssignment = user.orderAssignments[0]
    const hasException = user.userActivityEntries.some((entry) => entry.actionType.includes('EXCEPTION'))

    const status = deriveUserStatus({
      isLoggedIn: user.isLoggedIn,
      hasActiveOrder: user.orderAssignments.length > 0,
      hasExceptionActivity: hasException,
      lastActivityAt: lastActivity?.createdAt
    })

    const activeOrderLabel = activeAssignment
      ? await getOrderReference(prisma, activeAssignment.orderType, activeAssignment.orderId)
      : undefined

    return {
      userId: user.id,
      name: user.fullName,
      role: user.role,
      warehouseId: warehouse?.warehouseId,
      warehouseName: warehouse?.warehouse.name,
      status,
      activeOrderLabel,
      deviceCode: user.lastLoginDevice?.code ?? undefined,
      lastActivityAt: lastActivity?.createdAt?.toISOString(),
      href: `/dashboard/users/${user.id}`
    }
  }))

  const warehouseMap = new Map<string, {
    warehouseId: string
    warehouseName: string
    activeUsers: number
    idleUsers: number
    totalUsers: number
    activeOrders: number
  }>()

  for (const user of userRows) {
    if (!user.warehouseId || !user.warehouseName) {
      continue
    }

    const aggregate = warehouseMap.get(user.warehouseId) ?? {
      warehouseId: user.warehouseId,
      warehouseName: user.warehouseName,
      activeUsers: 0,
      idleUsers: 0,
      totalUsers: 0,
      activeOrders: 0
    }

    aggregate.totalUsers++
    if (user.status === 'ACTIVE') {
      aggregate.activeUsers++
    } else if (user.status === 'IDLE') {
      aggregate.idleUsers++
    }
    if (user.activeOrderLabel) {
      aggregate.activeOrders++
    }

    warehouseMap.set(user.warehouseId, aggregate)
  }

  const warehouseSummaries = [...warehouseMap.values()].map((warehouse) => ({
    warehouseId: warehouse.warehouseId,
    warehouseName: warehouse.warehouseName,
    activeUsers: warehouse.activeUsers,
    idleUsers: warehouse.idleUsers,
    totalUsers: warehouse.totalUsers,
    activeOrders: warehouse.activeOrders,
    averageOrdersPerUser: warehouse.totalUsers > 0
      ? Math.round((warehouse.activeOrders / warehouse.totalUsers) * 100) / 100
      : 0,
    href: `/dashboard/warehouses/${warehouse.warehouseId}/users`
  }))

  const kpis: DashboardKpi[] = [
    {
      label: 'Active',
      value: String(userRows.filter((user) => user.status === 'ACTIVE').length),
      helper: 'Operators currently signed in',
      tone: 'success'
    },
    {
      label: 'Idle',
      value: String(userRows.filter((user) => user.status === 'IDLE').length),
      helper: 'Signed in but not active',
      tone: 'warning'
    },
    {
      label: 'Logged out',
      value: String(userRows.filter((user) => user.status === 'LOGGED_OUT').length),
      helper: 'No active session',
      tone: 'neutral'
    },
    {
      label: 'Assigned',
      value: String(userRows.filter((user) => Boolean(user.activeOrderLabel)).length),
      helper: 'Operators with live order work',
      tone: 'success'
    },
    {
      label: 'In exception flow',
      value: String(userRows.filter((user) => user.status === 'IN_EXCEPTION').length),
      helper: 'Operators handling exceptions',
      tone: 'danger'
    }
  ]

  return {
    header: {
      title: 'Users Dashboard',
      subtitle: warehouseId ? 'Warehouse-scoped operator status and workload' : 'Network-wide operator status and workload'
    },
    kpis,
    warehouseSummaries,
    users: userRows
  }
}
