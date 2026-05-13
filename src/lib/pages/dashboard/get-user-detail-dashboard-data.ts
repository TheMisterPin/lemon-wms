import type { OrderType, PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { getOrderProgressSnapshot } from '@/lib/orders/shared/order-execution-progress-queries'
import type { DashboardKpi } from '@/types/bin-detail-dashboard.types'
import type { DeviceCurrentWorkRow } from '@/types/device-detail-dashboard.types'
import type { OrderSummaryRow } from '@/types/orders-dashboard.types'
import type { UserActivityRow, UserDetailDashboardDTO, UserSessionRow } from '@/types/user-detail-dashboard.types'

function orderHref(type: OrderType, orderId: string): string {
  return `/dashboard/orders/${type.toLowerCase()}/${orderId}`
}

async function getOrderStatus(prisma: PrismaClient, orderType: OrderType, orderId: string): Promise<string> {
  if (orderType === 'PURCHASE') {
    const order = await prisma.purchaseOrder.findFirst({ where: { id: orderId }, select: { status: true } })

    return order?.status ?? 'DRAFT'
  }
  if (orderType === 'SALES') {
    const order = await prisma.salesOrder.findFirst({ where: { id: orderId }, select: { status: true } })

    return order?.status ?? 'DRAFT'
  }
  if (orderType === 'TRANSFER') {
    const order = await prisma.transferOrder.findFirst({ where: { id: orderId }, select: { status: true } })

    return order?.status ?? 'DRAFT'
  }
  if (orderType === 'RETURN') {
    const order = await prisma.returnOrder.findFirst({ where: { id: orderId }, select: { status: true } })

    return order?.status ?? 'DRAFT'
  }

  const order = await prisma.adjustmentOrder.findFirst({ where: { id: orderId }, select: { status: true } })

  return order?.status ?? 'DRAFT'
}

function durationLabel(startedAt: Date, endedAt?: Date | null): string | undefined {
  if (!endedAt) {
    return undefined
  }

  const minutes = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000))

  return minutes < 60 ? `${minutes}m` : `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function mapActivityType(actionType: string): UserActivityRow['type'] {
  if (actionType.includes('LOGIN')) {
    return 'LOGIN'
  }
  if (actionType.includes('LOGOUT')) {
    return 'LOGOUT'
  }
  if (actionType.includes('EXCEPTION')) {
    return 'EXCEPTION'
  }
  if (actionType.includes('BIN') || actionType.includes('MOVE') || actionType.includes('LOT')) {
    return 'MOVEMENT'
  }
  if (actionType.includes('DEVICE')) {
    return 'DEVICE'
  }

  return 'ORDER'
}

export async function getUserDetailDashboardData(
  prisma: PrismaClient,
  userId: string
): Promise<UserDetailDashboardDTO> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      fullName: true,
      role: true,
      lastLoginDevice: { select: { code: true } },
      warehouseAssignments: {
        select: {
          warehouse: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      orderAssignments: {
        orderBy: { assignedAt: 'desc' },
        select: {
          id: true,
          orderId: true,
          orderType: true,
          status: true,
          isActive: true,
          assignedAt: true,
          startedAt: true,
          completedAt: true
        }
      },
      userActivityEntries: {
        orderBy: { createdAt: 'desc' },
        take: 100,
        select: {
          id: true,
          createdAt: true,
          actionType: true,
          entityType: true,
          entityId: true,
          notes: true,
          metadata: true,
          warehouse: { select: { name: true } }
        }
      },
      deviceSessions: {
        orderBy: { loginAt: 'desc' },
        take: 100,
        select: {
          id: true,
          loginAt: true,
          logoutAt: true,
          device: { select: { code: true } },
          warehouse: { select: { name: true } }
        }
      }
    }
  })

  if (!user) {
    throw new DomainError('User not found.', 'NOT_FOUND', 404)
  }

  const currentAssignments = user.orderAssignments
    .filter((assignment) => assignment.isActive)
    .slice(0, 20)

  const currentWorkSnapshots = await Promise.all(
    currentAssignments.map((a) => getOrderProgressSnapshot(prisma, a.orderId, a.orderType))
  )

  const currentWork: DeviceCurrentWorkRow[] = currentAssignments.map((assignment, idx) => {
    const snap = currentWorkSnapshots[idx]

    return {
      orderId: assignment.orderId,
      orderLabel: snap.reference,
      orderType: assignment.orderType,
      progressPercent: snap.progressPercent,
      userId: user.id,
      userName: user.fullName,
      startedAt: assignment.startedAt?.toISOString() ?? assignment.assignedAt.toISOString(),
      href: orderHref(assignment.orderType, assignment.orderId)
    }
  })

  const uniqueOrders = new Map<string, { orderId: string; orderType: OrderType; startedAt: Date }>()
  for (const assignment of user.orderAssignments) {
    const key = `${assignment.orderType}:${assignment.orderId}`
    if (!uniqueOrders.has(key)) {
      uniqueOrders.set(key, {
        orderId: assignment.orderId,
        orderType: assignment.orderType,
        startedAt: assignment.startedAt ?? assignment.assignedAt
      })
    }
  }

  const orderSnapshots = await Promise.all(
    [...uniqueOrders.values()].map((entry) => getOrderProgressSnapshot(prisma, entry.orderId, entry.orderType))
  )

  const orderWhIds = [
    ...new Set(orderSnapshots.map((s) => s.warehouseId).filter((id) => id.length > 0))
  ]

  const orderWarehouses = orderWhIds.length
    ? await prisma.warehouse.findMany({
      where: { id: { in: orderWhIds } },
      select: { id: true, name: true }
    })
    : []

  const orderWarehouseNameById = new Map(orderWarehouses.map((w) => [w.id, w.name]))

  const orders: OrderSummaryRow[] = await Promise.all(
    [...uniqueOrders.values()].map(async (entry, idx) => {
      const snap = orderSnapshots[idx]
      const whName = orderWarehouseNameById.get(snap.warehouseId) ?? ''
      const status = await getOrderStatus(prisma, entry.orderType, entry.orderId)

      return {
        orderId: entry.orderId,
        orderLabel: snap.reference,
        type: entry.orderType,
        warehouseId: snap.warehouseId,
        warehouseName: whName || '—',
        status,
        progressPercent: snap.progressPercent,
        assignedUserName: user.fullName,
        startedAt: entry.startedAt.toISOString(),
        href: orderHref(entry.orderType, entry.orderId)
      }
    })
  )

  const activity: UserActivityRow[] = user.userActivityEntries.map((entry) => ({
    activityId: entry.id,
    occurredAt: entry.createdAt.toISOString(),
    type: mapActivityType(entry.actionType),
    action: entry.actionType,
    warehouseName: entry.warehouse?.name ?? undefined,
    entityLabel: `${entry.entityType} ${entry.entityId}`,
    details: entry.notes ?? 'No details',
    metadata: (entry.metadata as Record<string, unknown>) ?? undefined
  }))

  const sessions: UserSessionRow[] = user.deviceSessions.map((session) => ({
    sessionId: session.id,
    loginAt: session.loginAt.toISOString(),
    logoutAt: session.logoutAt?.toISOString(),
    durationLabel: durationLabel(session.loginAt, session.logoutAt),
    deviceCode: session.device.code,
    warehouseName: session.warehouse?.name ?? undefined
  }))

  const completedOrders = user.orderAssignments.filter((assignment) => assignment.status === 'COMPLETED')
  const completedToday = completedOrders.filter((assignment) => {
    if (!assignment.completedAt) {
      return false
    }

    return assignment.completedAt.toDateString() === new Date().toDateString()
  })

  const completedDurations = completedOrders
    .map((assignment) => {
      if (!assignment.startedAt || !assignment.completedAt) {
        return null
      }

      return Math.max(0, Math.round((assignment.completedAt.getTime() - assignment.startedAt.getTime()) / 60000))
    })
    .filter((value): value is number => value !== null)

  const avgDuration = completedDurations.length > 0
    ? `${Math.round(completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length)}m`
    : '—'

  const exceptionCount = activity.filter((entry) => entry.type === 'EXCEPTION').length

  const kpis: DashboardKpi[] = [
    {
      label: 'Active orders',
      value: String(currentWork.length),
      helper: 'Assignments in progress',
      tone: currentWork.length > 0 ? 'success' : 'neutral'
    },
    {
      label: 'Completed today',
      value: String(completedToday.length),
      helper: 'Finished assignments today',
      tone: completedToday.length > 0 ? 'success' : 'neutral'
    },
    {
      label: 'Total completed',
      value: String(completedOrders.length),
      helper: 'All-time completed assignments',
      tone: 'neutral'
    },
    {
      label: 'Last device',
      value: user.lastLoginDevice?.code ?? '—',
      helper: 'Most recent sign-in device',
      tone: 'neutral'
    },
    {
      label: 'Current warehouse',
      value: user.warehouseAssignments[0]?.warehouse?.name ?? '—',
      helper: 'Primary warehouse assignment',
      tone: 'neutral'
    },
    {
      label: 'Exceptions handled',
      value: String(exceptionCount),
      helper: 'Logged exception activities',
      tone: exceptionCount > 0 ? 'warning' : 'neutral'
    },
    {
      label: 'Avg completion time',
      value: avgDuration,
      helper: 'Across completed assignments',
      tone: 'neutral'
    }
  ]

  return {
    header: {
      title: user.fullName,
      subtitle: user.role,
      userId: user.id,
      name: user.fullName,
      role: user.role,
      currentWarehouseName: user.warehouseAssignments[0]?.warehouse?.name ?? undefined,
      currentDeviceCode: user.lastLoginDevice?.code ?? undefined
    },
    kpis,
    currentWork,
    activity,
    orders,
    sessions
  }
}
