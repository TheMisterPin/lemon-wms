import { AssignmentLifecycle, type OrderType, type PrismaClient } from '@/generated/prisma'
import { mapOrderAssignmentToDetailDTO, mapOrderAssignmentToListItemDTO, orderAssignmentDetailSelect, orderAssignmentListSelect } from './order-execution.helpers'
import type { AssignedUserOnOrderDTO, DuplicateActiveOrderAssignmentClusterDTO, OrderAssignmentDetailDTO, OrderAssignmentListItemDTO } from './order-execution.types'

/** `assignedAt` desc, then `id` desc for stable “newest / latest” ordering. */
const ORDER_BY_ASSIGNED_AT_DESC: [{ assignedAt: 'desc' }, { id: 'desc' }] = [
  { assignedAt: 'desc' },
  { id: 'desc' }
]

const NON_CANCELLED_LIFECYCLES_EXPECTING_A_START: AssignmentLifecycle[] = [
  AssignmentLifecycle.STARTED,
  AssignmentLifecycle.PAUSED,
  AssignmentLifecycle.RESUMED,
  AssignmentLifecycle.COMPLETED,
  AssignmentLifecycle.RELEASED,
  AssignmentLifecycle.TIMED_OUT
]

export async function getOrderAssignmentById(
  prisma: PrismaClient,
  id: string
): Promise<OrderAssignmentDetailDTO | null> {
  const row = await prisma.orderAssignment.findUnique({
    where: { id },
    select: orderAssignmentDetailSelect
  })

  return row ? mapOrderAssignmentToDetailDTO(row) : null
}

/**
 * The single most recent `OrderAssignment` row for the order key (`assignedAt` desc, `id` desc).
 * Picks the winner when multiple users have rows for the same order.
 */
export async function getLatestOrderAssignmentForOrder(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<OrderAssignmentDetailDTO | null> {
  const row = await prisma.orderAssignment.findFirst({
    where: { orderType, orderId },
    select: orderAssignmentDetailSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return row ? mapOrderAssignmentToDetailDTO(row) : null
}

/**
 * The most recent row for the unique `(orderType, orderId, userId)` session (if any);
 * `assignedAt` desc, `id` desc.
 */
export async function getLatestOrderAssignmentForUserOnOrder(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string,
  userId: string
): Promise<OrderAssignmentDetailDTO | null> {
  const row = await prisma.orderAssignment.findFirst({
    where: { orderType, orderId, userId },
    select: orderAssignmentDetailSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return row ? mapOrderAssignmentToDetailDTO(row) : null
}

export async function getOrderAssignmentsByUser(
  prisma: PrismaClient,
  userId: string
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { userId },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

/** Sessions with `isActive: true` (regardless of PAUSED, STARTED, etc.). */
export async function getActiveOrderAssignmentsByUser(
  prisma: PrismaClient,
  userId: string
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { userId, isActive: true },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

/** Inactive session rows (storage flag `isActive: false` — not “paused at work” semantics). */
export async function getInactiveOrderAssignmentsByUser(
  prisma: PrismaClient,
  userId: string
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { userId, isActive: false },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getCompletedOrderAssignmentsByUserInRange(
  prisma: PrismaClient,
  userId: string,
  from: Date,
  to: Date
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: {
      userId,
      isActive: false,
      status: AssignmentLifecycle.COMPLETED,
      completedAt: { gte: from, lte: to }
    },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getPausedOrderAssignmentsByUser(
  prisma: PrismaClient,
  userId: string
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { userId, status: AssignmentLifecycle.PAUSED },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getOrderAssignmentsByOrder(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { orderType, orderId },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getActiveOrderAssignmentsByOrder(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { orderType, orderId, isActive: true },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getHistoricalOrderAssignmentsByOrder(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { orderType, orderId, isActive: false },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

/**
 * One entry per `userId`: fields come from each user’s **first** row in a list ordered by
 * `assignedAt` desc, `id` desc (so each value reflects that user’s latest session on this order).
 * Array sorted by that `latestAssignedAt` desc, then `userId` to break ties.
 */
export async function getUsersAssignedToOrder(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<AssignedUserOnOrderDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { orderType, orderId },
    select: {
      id: true,
      userId: true,
      assignedAt: true,
      status: true,
      user: { select: { fullName: true, badgeNumber: true } }
    },
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  const byUser = new Map<string, AssignedUserOnOrderDTO>()
  for (const r of rows) {
    if (byUser.has(r.userId)) {
      continue
    }
    byUser.set(r.userId, {
      userId: r.userId,
      userFullName: r.user.fullName,
      badgeNumber: r.user.badgeNumber,
      latestAssignmentId: r.id,
      latestAssignedAt: r.assignedAt,
      latestStatus: r.status
    })
  }

  return Array.from(byUser.values()).sort(
    (a, b) => b.latestAssignedAt.getTime() - a.latestAssignedAt.getTime() || a.userId.localeCompare(b.userId)
  )
}

export async function getOrderAssignmentsByWarehouse(
  prisma: PrismaClient,
  warehouseId: string
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { warehouseId },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getActiveOrderAssignmentsByWarehouse(
  prisma: PrismaClient,
  warehouseId: string
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { warehouseId, isActive: true },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getPausedOrderAssignmentsByWarehouse(
  prisma: PrismaClient,
  warehouseId: string
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { warehouseId, status: AssignmentLifecycle.PAUSED },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getCompletedOrderAssignmentsByWarehouseInRange(
  prisma: PrismaClient,
  warehouseId: string,
  from: Date,
  to: Date
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: {
      warehouseId,
      isActive: false,
      status: AssignmentLifecycle.COMPLETED,
      completedAt: { gte: from, lte: to }
    },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getOrderAssignmentsByStatus(
  prisma: PrismaClient,
  status: AssignmentLifecycle
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { status },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getAssignedButNotStartedOrderAssignments(
  prisma: PrismaClient
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { status: AssignmentLifecycle.ASSIGNED },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

/**
 * `isActive` sessions where work is actually under way: `STARTED` or `RESUMED` (excludes `PAUSED`,
 * `ASSIGNED`, and any inactive / terminal row).
 */
export async function getStartedButNotCompletedOrderAssignments(
  prisma: PrismaClient
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: {
      isActive: true,
      startedAt: { not: null },
      status: { in: [AssignmentLifecycle.STARTED, AssignmentLifecycle.RESUMED] }
    },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getReleasedOrderAssignmentsInRange(
  prisma: PrismaClient,
  from: Date,
  to: Date
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: {
      isActive: false,
      status: AssignmentLifecycle.RELEASED,
      releasedAt: { gte: from, lte: to }
    },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getCancelledOrderAssignmentsInRange(
  prisma: PrismaClient,
  from: Date,
  to: Date
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: {
      isActive: false,
      status: AssignmentLifecycle.CANCELLED,
      cancelledAt: { gte: from, lte: to }
    },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getTimedOutOrderAssignmentsInRange(
  prisma: PrismaClient,
  from: Date,
  to: Date
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: {
      isActive: false,
      status: AssignmentLifecycle.TIMED_OUT,
      timedOutAt: { gte: from, lte: to }
    },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getStaleActiveOrderAssignments(
  prisma: PrismaClient,
  staleBefore: Date
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: {
      isActive: true,
      OR: [{ startedAt: { lt: staleBefore } }, { AND: [{ startedAt: null }, { assignedAt: { lt: staleBefore } }] }]
    },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

/**
 * `startedAt` is null on rows whose lifecycle should imply work has started; excludes `ASSIGNED`
 * and `CANCELLED` (cancel-from-assigned never has a start).
 */
export async function getOrderAssignmentsMissingStartTimestamp(
  prisma: PrismaClient
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: {
      startedAt: null,
      status: { in: NON_CANCELLED_LIFECYCLES_EXPECTING_A_START }
    },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

export async function getOrderAssignmentsWithNoActivities(
  prisma: PrismaClient
): Promise<OrderAssignmentListItemDTO[]> {
  const rows = await prisma.orderAssignment.findMany({
    where: { activities: { none: {} } },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  return rows.map(mapOrderAssignmentToListItemDTO)
}

/**
 * Orders with **more than one concurrent active session** (multiple rows with `isActive: true` for
 * the same `orderType`+`orderId` — e.g. different users). This is a concurrency/constraint signal,
 * not a duplicate of `(orderType,orderId,userId)`.
 */
export async function getOrdersWithMultipleActiveAssignments(
  prisma: PrismaClient
): Promise<DuplicateActiveOrderAssignmentClusterDTO[]> {
  const grouped = await prisma.orderAssignment.groupBy({
    by: ['orderType', 'orderId'],
    where: { isActive: true },
    _count: { id: true }
  })
  const orderKeysWithMultipleActives = grouped.filter((g) => g._count.id > 1)

  if (orderKeysWithMultipleActives.length === 0) {
    return []
  }

  const rows = await prisma.orderAssignment.findMany({
    where: {
      OR: orderKeysWithMultipleActives.map((g) => ({
        orderType: g.orderType,
        orderId: g.orderId,
        isActive: true
      }))
    },
    select: orderAssignmentListSelect,
    orderBy: ORDER_BY_ASSIGNED_AT_DESC
  })

  const byKey = new Map<string, OrderAssignmentListItemDTO[]>()
  for (const row of rows) {
    const dto = mapOrderAssignmentToListItemDTO(row)
    const k = `${dto.orderType}:${dto.orderId}`
    const list = byKey.get(k) ?? []
    list.push(dto)
    byKey.set(k, list)
  }

  return [...byKey.values()]
    .filter((list) => list.length > 1)
    .map((list) => ({
      orderType: list[0].orderType,
      orderId: list[0].orderId,
      activeAssignmentCount: list.length,
      assignments: list
    }))
}
