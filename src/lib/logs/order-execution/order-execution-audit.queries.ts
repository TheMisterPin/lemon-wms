import type { PrismaClient } from '@/generated/prisma'
import { AssignmentLifecycle, ExecutionActivity, type OrderType } from '@/generated/prisma'
import {
  mapAssignmentWithLatestActivityDTO,
  mapOrderAssignmentToDetailDTO,
  mapOrderAssignmentToListItemDTO,
  mapOrderExecutionActivityToDetailDTO,
  mapOrderExecutionActivityToListItemDTO,
  mapOrderExecutionTimelineDTO,
  orderAssignmentDetailSelect,
  orderAssignmentListSelect,
  orderExecutionActivityDetailSelect,
  orderExecutionActivityListSelect,
  type OrderExecutionActivityDetailRow,
  type OrderExecutionActivityListRow
} from './order-execution.helpers'
import type {
  ActivityOrderMismatchDTO,
  ActivityUserMismatchDTO,
  ActivityWarehouseMismatchDTO,
  AssignmentActivityAfterCompletionDTO,
  AssignmentActivityWhilePausedDTO,
  AssignmentLastActivityExceptionRaisedDTO,
  AssignmentLatestActivityDTO,
  OrderAssignmentDetailWithLatestActivityDTO,
  OrderAssignmentExecutionTimelineDTO,
  OrderExecutionActivityListItemDTO,
  OrderExecutionFlatTimelineDTO,
  OrderExecutionSummaryDTO,
  OrderExecutionTimelineDTO,
  OrderLineExecutionTimelineDTO,
  OrderLineLatestActivitySnapshotDTO,
  OrderWithUnresolvedExceptionDTO,
  UserWhoTouchedOrderDTO,
  UserWhoTouchedOrderLineDTO
} from './order-execution.types'

export type {
  OrderAssignmentExecutionTimelineDTO,
  OrderExecutionSummaryDTO,
  OrderExecutionTimelineDTO,
  OrderAssignmentDetailWithLatestActivityDTO,
  AssignmentLatestActivityDTO,
  OrderWithUnresolvedExceptionDTO,
  AssignmentLastActivityExceptionRaisedDTO,
  AssignmentActivityAfterCompletionDTO,
  AssignmentActivityWhilePausedDTO,
  ActivityOrderMismatchDTO,
  ActivityWarehouseMismatchDTO,
  ActivityUserMismatchDTO
} from './order-execution.types'

/** Execution events oldest first (one stream). */
const TIMELINE_ASC: [{ createdAt: 'asc' }, { id: 'asc' }] = [{ createdAt: 'asc' }, { id: 'asc' }]

/** Execution events newest first. */
const RECENCY_DESC: [{ createdAt: 'desc' }, { id: 'desc' }] = [{ createdAt: 'desc' }, { id: 'desc' }]

/** Assignment rows newest first. */
const ASSIGNMENT_RECENCY: [{ assignedAt: 'desc' }, { id: 'desc' }] = [{ assignedAt: 'desc' }, { id: 'desc' }]

function toActivityListDtos(rows: OrderExecutionActivityListRow[]): OrderExecutionActivityListItemDTO[] {
  return rows.map(mapOrderExecutionActivityToListItemDTO)
}

/**
 * Assignment header plus activities in this session, chronological (oldest first).
 */
export async function getOrderAssignmentExecutionTimeline(
  prisma: PrismaClient,
  orderAssignmentId: string
): Promise<OrderAssignmentExecutionTimelineDTO | null> {
  const assignment = await prisma.orderAssignment.findUnique({
    where: { id: orderAssignmentId },
    select: orderAssignmentDetailSelect
  })

  if (!assignment) {
    return null
  }

  const activityRows = await prisma.orderExecutionActivity.findMany({
    where: { orderAssignmentId },
    select: orderExecutionActivityListSelect,
    orderBy: TIMELINE_ASC
  })

  return {
    assignment: mapOrderAssignmentToDetailDTO(assignment),
    activities: toActivityListDtos(activityRows)
  }
}

export async function getOrderAssignmentWithActivities(
  prisma: PrismaClient,
  orderAssignmentId: string
): Promise<OrderAssignmentExecutionTimelineDTO | null> {
  return getOrderAssignmentExecutionTimeline(prisma, orderAssignmentId)
}

/**
 * Assignment plus the single newest activity in that session (`createdAt` desc, `id` desc).
 */
export async function getOrderAssignmentWithLatestActivity(
  prisma: PrismaClient,
  orderAssignmentId: string
): Promise<OrderAssignmentDetailWithLatestActivityDTO | null> {
  const assignment = await prisma.orderAssignment.findUnique({
    where: { id: orderAssignmentId },
    select: orderAssignmentDetailSelect
  })

  if (!assignment) {
    return null
  }

  const latest = await prisma.orderExecutionActivity.findFirst({
    where: { orderAssignmentId },
    select: orderExecutionActivityDetailSelect,
    orderBy: RECENCY_DESC
  })

  return {
    assignment: mapOrderAssignmentToDetailDTO(assignment),
    latestActivity: latest ? mapOrderExecutionActivityToDetailDTO(latest) : null
  }
}

/**
 * Every assignment on the order (`assignedAt` desc, `id` desc), each with that session’s newest
 * activity (`createdAt` desc, `id` desc) if any.
 */
export async function getOrderAssignmentsWithLatestActivity(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<AssignmentLatestActivityDTO[]> {
  const assignments = await prisma.orderAssignment.findMany({
    where: { orderType, orderId },
    select: orderAssignmentListSelect,
    orderBy: ASSIGNMENT_RECENCY
  })

  const activityRows = await prisma.orderExecutionActivity.findMany({
    where: { orderType, orderId },
    select: orderExecutionActivityListSelect,
    orderBy: RECENCY_DESC
  })

  const latestByAssignment = new Map<string, OrderExecutionActivityListRow>()
  for (const row of activityRows) {
    if (!latestByAssignment.has(row.orderAssignmentId)) {
      latestByAssignment.set(row.orderAssignmentId, row)
    }
  }

  return assignments.map((a) =>
    mapAssignmentWithLatestActivityDTO(a, latestByAssignment.get(a.id) ?? null)
  )
}

/**
 * Order-scoped activities grouped by assignment: sessions by `assignedAt` desc, `id` desc; within
 * each bucket, activities chronological (oldest first).
 */
export async function getOrderExecutionTimelineGroupedByAssignment(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<OrderExecutionTimelineDTO> {
  const assignments = await prisma.orderAssignment.findMany({
    where: { orderType, orderId },
    select: orderAssignmentListSelect,
    orderBy: ASSIGNMENT_RECENCY
  })

  const activityRows = await prisma.orderExecutionActivity.findMany({
    where: { orderType, orderId },
    select: orderExecutionActivityListSelect,
    orderBy: TIMELINE_ASC
  })

  return mapOrderExecutionTimelineDTO(orderId, orderType, assignments, activityRows)
}

/**
 * Flat order-level stream: all activities for `orderType` + `orderId`, chronological (oldest first).
 */
export async function getOrderExecutionTimeline(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<OrderExecutionFlatTimelineDTO> {
  const activityRows = await prisma.orderExecutionActivity.findMany({
    where: { orderType, orderId },
    select: orderExecutionActivityListSelect,
    orderBy: TIMELINE_ASC
  })

  return {
    orderId,
    orderType,
    activities: toActivityListDtos(activityRows)
  }
}

/**
 * All activities for one line (`orderType` + `orderId` + `orderLineRefId`), chronological.
 */
export async function getOrderLineExecutionTimeline(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string,
  orderLineRefId: string
): Promise<OrderLineExecutionTimelineDTO> {
  const activityRows = await prisma.orderExecutionActivity.findMany({
    where: { orderType, orderId, orderLineRefId },
    select: orderExecutionActivityListSelect,
    orderBy: TIMELINE_ASC
  })

  return {
    orderId,
    orderType,
    orderLineRefId,
    activities: toActivityListDtos(activityRows)
  }
}

export async function getOrderLineExecutionTrailAcrossAssignments(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string,
  orderLineRefId: string
): Promise<OrderLineExecutionTimelineDTO> {
  return getOrderLineExecutionTimeline(prisma, orderType, orderId, orderLineRefId)
}

/**
 * Newest activity per distinct `orderLineRefId` on the order (scan in `createdAt` desc, `id` desc; first
 * per line wins).
 */
export async function getLatestActivityForEachOrderLine(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<OrderLineLatestActivitySnapshotDTO[]> {
  const activityRows = await prisma.orderExecutionActivity.findMany({
    where: { orderType, orderId, orderLineRefId: { not: null } },
    select: orderExecutionActivityListSelect,
    orderBy: RECENCY_DESC
  })

  const seen = new Set<string>()
  const out: OrderLineLatestActivitySnapshotDTO[] = []

  for (const r of activityRows) {
    const lineId = r.orderLineRefId
    if (lineId === null || seen.has(lineId)) {
      continue
    }
    seen.add(lineId)
    out.push({
      orderLineRefId: lineId,
      activity: mapOrderExecutionActivityToListItemDTO(r)
    })
  }

  return out
}

/** Counts, bounds, and exception tallies for one order (audit / ops summary). */
export async function getOrderExecutionSummaryForOrder(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<OrderExecutionSummaryDTO> {
  const [
    assignmentCount,
    activeAssignmentCount,
    agg,
    exceptionRaisedCount,
    exceptionResolvedCount,
    actorGroups
  ] = await Promise.all([
    prisma.orderAssignment.count({ where: { orderType, orderId } }),
    prisma.orderAssignment.count({ where: { orderType, orderId, isActive: true } }),
    prisma.orderExecutionActivity.aggregate({
      where: { orderType, orderId },
      _min: { createdAt: true },
      _max: { createdAt: true },
      _count: { _all: true }
    }),
    prisma.orderExecutionActivity.count({
      where: { orderType, orderId, activityType: ExecutionActivity.EXCEPTION_RAISED }
    }),
    prisma.orderExecutionActivity.count({
      where: { orderType, orderId, activityType: ExecutionActivity.EXCEPTION_RESOLVED }
    }),
    prisma.orderExecutionActivity.groupBy({
      by: ['userId'],
      where: { orderType, orderId }
    })
  ])

  return {
    orderId,
    orderType,
    assignmentCount,
    activeAssignmentCount,
    activityCount: agg._count._all,
    distinctActorCount: actorGroups.length,
    firstActivityAt: agg._min.createdAt,
    lastActivityAt: agg._max.createdAt,
    exceptionRaisedCount,
    exceptionResolvedCount
  }
}

/** Distinct actors on the order, with counts and last touch (from activity aggregates). */
export async function getUsersWhoTouchedOrder(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<UserWhoTouchedOrderDTO[]> {
  const grouped = await prisma.orderExecutionActivity.groupBy({
    by: ['userId'],
    where: { orderType, orderId },
    _count: { _all: true },
    _max: { createdAt: true }
  })

  if (grouped.length === 0) {
    return []
  }

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, fullName: true, badgeNumber: true }
  })
  const userMap = new Map(users.map((u) => [u.id, u]))

  return grouped
    .map((g) => {
      const u = userMap.get(g.userId)

      return {
        userId: g.userId,
        userFullName: u?.fullName ?? '',
        badgeNumber: u?.badgeNumber ?? '',
        activityCount: g._count._all,
        lastTouchedAt: g._max.createdAt as Date
      }
    })
    .sort((a, b) => a.userId.localeCompare(b.userId))
}

export async function getUsersWhoTouchedOrderLine(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string,
  orderLineRefId: string
): Promise<UserWhoTouchedOrderLineDTO[]> {
  const grouped = await prisma.orderExecutionActivity.groupBy({
    by: ['userId'],
    where: { orderType, orderId, orderLineRefId },
    _count: { _all: true },
    _max: { createdAt: true }
  })

  if (grouped.length === 0) {
    return []
  }

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((g) => g.userId) } },
    select: { id: true, fullName: true, badgeNumber: true }
  })
  const userMap = new Map(users.map((u) => [u.id, u]))

  return grouped
    .map((g) => {
      const u = userMap.get(g.userId)

      return {
        userId: g.userId,
        userFullName: u?.fullName ?? '',
        badgeNumber: u?.badgeNumber ?? '',
        activityCount: g._count._all,
        lastTouchedAt: g._max.createdAt as Date
      }
    })
    .sort((a, b) => a.userId.localeCompare(b.userId))
}

function isActivityEventNewer(
  a: { createdAt: Date; id: string },
  b: { createdAt: Date; id: string } | undefined
): boolean {
  if (!b) {
    return true
  }
  if (a.createdAt.getTime() !== b.createdAt.getTime()) {
    return a.createdAt > b.createdAt
  }

  return a.id > b.id
}

/**
 * Orders where the “latest” `EXCEPTION_RAISED` (by `createdAt` desc, `id` desc) is after the
 * “latest” `EXCEPTION_RESOLVED` (same rule), or there is no resolution.
 */
export async function getOrdersWithRaisedExceptionsAndNoResolution(
  prisma: PrismaClient
): Promise<OrderWithUnresolvedExceptionDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: {
      activityType: { in: [ExecutionActivity.EXCEPTION_RAISED, ExecutionActivity.EXCEPTION_RESOLVED] }
    },
    select: { orderId: true, orderType: true, activityType: true, createdAt: true, id: true }
  })

  const byOrder = new Map<
    string,
    {
      orderId: string
      orderType: OrderType
      bestRaised?: { createdAt: Date; id: string }
      bestResolved?: { createdAt: Date; id: string }
    }
  >()

  for (const r of rows) {
    const key = `${r.orderType}:${r.orderId}`
    let entry = byOrder.get(key)
    if (!entry) {
      entry = { orderId: r.orderId, orderType: r.orderType }
      byOrder.set(key, entry)
    }
    const ev = { createdAt: r.createdAt, id: r.id }
    if (r.activityType === ExecutionActivity.EXCEPTION_RAISED) {
      if (isActivityEventNewer(ev, entry.bestRaised)) {
        entry.bestRaised = ev
      }
    } else if (r.activityType === ExecutionActivity.EXCEPTION_RESOLVED) {
      if (isActivityEventNewer(ev, entry.bestResolved)) {
        entry.bestResolved = ev
      }
    }
  }

  const out: OrderWithUnresolvedExceptionDTO[] = []
  for (const v of byOrder.values()) {
    if (!v.bestRaised) {
      continue
    }
    if (!v.bestResolved || isActivityEventNewer(v.bestRaised, v.bestResolved)) {
      out.push({
        orderId: v.orderId,
        orderType: v.orderType,
        lastRaisedAt: v.bestRaised.createdAt,
        lastResolvedAt: v.bestResolved?.createdAt ?? null
      })
    }
  }

  return out.sort((a, b) => a.orderType.localeCompare(b.orderType) || a.orderId.localeCompare(b.orderId))
}

/**
 * Assignments whose globally newest activity is `EXCEPTION_RAISED` (full-table scan, batch jobs only).
 */
export async function getAssignmentsWithLastActivityExceptionRaised(
  prisma: PrismaClient
): Promise<AssignmentLastActivityExceptionRaisedDTO[]> {
  const activityRows = await prisma.orderExecutionActivity.findMany({
    select: orderExecutionActivityListSelect,
    orderBy: RECENCY_DESC
  })

  const latestByAssignment = new Map<string, OrderExecutionActivityListRow>()
  for (const row of activityRows) {
    if (!latestByAssignment.has(row.orderAssignmentId)) {
      latestByAssignment.set(row.orderAssignmentId, row)
    }
  }

  const raisedIds = [...latestByAssignment.entries()]
    .filter(([, act]) => act.activityType === ExecutionActivity.EXCEPTION_RAISED)
    .map(([id]) => id)

  if (raisedIds.length === 0) {
    return []
  }

  const assignments = await prisma.orderAssignment.findMany({
    where: { id: { in: raisedIds } },
    select: orderAssignmentListSelect
  })
  const map = new Map(assignments.map((a) => [a.id, mapOrderAssignmentToListItemDTO(a)]))

  const out: AssignmentLastActivityExceptionRaisedDTO[] = []
  for (const aid of raisedIds) {
    const assignment = map.get(aid)
    const latest = latestByAssignment.get(aid)
    if (assignment && latest) {
      out.push({ assignment, latestActivity: mapOrderExecutionActivityToListItemDTO(latest) })
    }
  }

  return out
}

export async function getAssignmentsWithActivityAfterCompletion(
  prisma: PrismaClient
): Promise<AssignmentActivityAfterCompletionDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: {
      orderAssignment: {
        completedAt: { not: null }
      }
    },
    select: {
      ...orderExecutionActivityListSelect,
      userId: true,
      orderAssignment: { select: { completedAt: true } }
    }
  })

  const grouped = new Map<string, OrderExecutionActivityListItemDTO[]>()
  for (const row of rows) {
    const completedAt = row.orderAssignment.completedAt
    if (!completedAt || row.createdAt <= completedAt) {
      continue
    }
    const item = mapOrderExecutionActivityToListItemDTO(row)
    const list = grouped.get(item.orderAssignmentId) ?? []
    list.push(item)
    grouped.set(item.orderAssignmentId, list)
  }

  if (grouped.size === 0) {
    return []
  }

  const assignments = await prisma.orderAssignment.findMany({
    where: { id: { in: [...grouped.keys()] } },
    select: orderAssignmentListSelect
  })

  return assignments.map((a) => ({
    assignment: mapOrderAssignmentToListItemDTO(a),
    activitiesAfterCompletion: grouped.get(a.id) ?? []
  }))
}

export async function getAssignmentsWithActivityWhilePaused(
  prisma: PrismaClient
): Promise<AssignmentActivityWhilePausedDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: {
      orderAssignment: {
        status: AssignmentLifecycle.PAUSED,
        pausedAt: { not: null }
      }
    },
    select: {
      ...orderExecutionActivityListSelect,
      userId: true,
      orderAssignment: { select: { id: true, pausedAt: true } }
    }
  })

  const grouped = new Map<string, OrderExecutionActivityListItemDTO[]>()
  for (const row of rows) {
    const pausedAt = row.orderAssignment.pausedAt
    if (!pausedAt || row.createdAt <= pausedAt) {
      continue
    }
    const item = mapOrderExecutionActivityToListItemDTO(row)
    const list = grouped.get(item.orderAssignmentId) ?? []
    list.push(item)
    grouped.set(item.orderAssignmentId, list)
  }

  if (grouped.size === 0) {
    return []
  }

  const assignments = await prisma.orderAssignment.findMany({
    where: { id: { in: [...grouped.keys()] } },
    select: orderAssignmentListSelect
  })

  return assignments.map((a) => ({
    assignment: mapOrderAssignmentToListItemDTO(a),
    activitiesAfterPause: grouped.get(a.id) ?? []
  }))
}

export async function getOrderExecutionActivitiesMismatchedToAssignmentOrder(
  prisma: PrismaClient
): Promise<ActivityOrderMismatchDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    select: {
      ...orderExecutionActivityDetailSelect,
      orderAssignment: { select: { id: true, orderId: true, orderType: true } }
    }
  })

  const out: ActivityOrderMismatchDTO[] = []
  for (const row of rows) {
    const a = row.orderAssignment
    if (row.orderId === a.orderId && row.orderType === a.orderType) {
      continue
    }
    const { orderAssignment: _assignment, ...rest } = row
    void _assignment
    out.push({
      activity: mapOrderExecutionActivityToDetailDTO(rest as OrderExecutionActivityDetailRow),
      assignment: { id: a.id, orderId: a.orderId, orderType: a.orderType }
    })
  }

  return out
}

export async function getOrderExecutionActivitiesMismatchedToAssignmentWarehouse(
  prisma: PrismaClient
): Promise<ActivityWarehouseMismatchDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    select: {
      ...orderExecutionActivityDetailSelect,
      orderAssignment: { select: { id: true, warehouseId: true } }
    }
  })

  const out: ActivityWarehouseMismatchDTO[] = []
  for (const row of rows) {
    const a = row.orderAssignment
    if (row.warehouseId === a.warehouseId) {
      continue
    }
    const { orderAssignment: _assignment, ...rest } = row
    void _assignment
    out.push({
      activity: mapOrderExecutionActivityToDetailDTO(rest as OrderExecutionActivityDetailRow),
      assignment: { id: a.id, warehouseId: a.warehouseId }
    })
  }

  return out
}

export async function getOrderExecutionActivitiesMismatchedToAssignmentUser(
  prisma: PrismaClient
): Promise<ActivityUserMismatchDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    select: {
      ...orderExecutionActivityDetailSelect,
      orderAssignment: { select: { id: true, userId: true } }
    }
  })

  const out: ActivityUserMismatchDTO[] = []
  for (const row of rows) {
    const a = row.orderAssignment
    if (row.userId === a.userId) {
      continue
    }
    const { orderAssignment: _assignment, ...rest } = row
    void _assignment
    out.push({
      activity: mapOrderExecutionActivityToDetailDTO(rest as OrderExecutionActivityDetailRow),
      assignment: { id: a.id, userId: a.userId }
    })
  }

  return out
}

export async function getOrdersWithActiveAssignmentsButNoExecutionActivities(
  prisma: PrismaClient
): Promise<Array<{ orderId: string; orderType: OrderType }>> {
  const activeOrderKeys = await prisma.orderAssignment.groupBy({
    by: ['orderId', 'orderType'],
    where: { isActive: true }
  })

  if (activeOrderKeys.length === 0) {
    return []
  }

  const activityKeys = await prisma.orderExecutionActivity.groupBy({
    by: ['orderId', 'orderType'],
    _count: { _all: true }
  })
  const withActivity = new Set(activityKeys.map((g) => `${g.orderType}:${g.orderId}`))

  return activeOrderKeys
    .filter((k) => !withActivity.has(`${k.orderType}:${k.orderId}`))
    .map((k) => ({ orderId: k.orderId, orderType: k.orderType }))
    .sort((a, b) => a.orderType.localeCompare(b.orderType) || a.orderId.localeCompare(b.orderId))
}
