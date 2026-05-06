import type { Prisma } from '@/generated/prisma'
import { ExecutionActivity, OrderType } from '@/generated/prisma'
import type {
  AssignmentLatestActivityDTO,
  LatestOrderExecutionActivityDTO,
  OrderAssignmentDetailDTO,
  OrderAssignmentListItemDTO,
  OrderExecutionActivityDetailDTO,
  OrderExecutionActivityListItemDTO,
  OrderExecutionTimelineDTO,
  OrderExecutionTimelineGroupDTO
} from './order-execution.types'

// -----------------------------------------------------------------------------
// Prisma select fragments
// -----------------------------------------------------------------------------

export const orderAssignmentListSelect = {
  id: true,
  orderId: true,
  orderType: true,
  status: true,
  warehouseId: true,
  userId: true,
  assignedAt: true,
  startedAt: true,
  pausedAt: true,
  releasedAt: true,
  completedAt: true,
  cancelledAt: true,
  timedOutAt: true,
  isActive: true,
  notes: true,
  warehouse: { select: { name: true } },
  user: { select: { fullName: true } }
} as const

export const orderAssignmentDetailSelect = {
  id: true,
  orderId: true,
  orderType: true,
  status: true,
  warehouseId: true,
  userId: true,
  assignedAt: true,
  startedAt: true,
  pausedAt: true,
  releasedAt: true,
  completedAt: true,
  cancelledAt: true,
  timedOutAt: true,
  isActive: true,
  notes: true,
  zoneId: true,
  warehouse: { select: { id: true, name: true } },
  user: { select: { id: true, fullName: true, badgeNumber: true } }
} as const

export const orderExecutionActivityListSelect = {
  id: true,
  orderAssignmentId: true,
  orderId: true,
  orderType: true,
  orderLineRefId: true,
  warehouseId: true,
  zoneId: true,
  userId: true,
  activityType: true,
  notes: true,
  createdAt: true,
  warehouse: { select: { name: true } },
  user: { select: { fullName: true } }
} as const

export const orderExecutionActivityDetailSelect = {
  id: true,
  orderAssignmentId: true,
  userId: true,
  warehouseId: true,
  zoneId: true,
  orderId: true,
  orderType: true,
  orderLineRefId: true,
  activityType: true,
  notes: true,
  createdAt: true,
  warehouse: { select: { id: true, name: true } },
  user: { select: { id: true, fullName: true, badgeNumber: true } }
} as const

// -----------------------------------------------------------------------------
// Raw row shapes (Prisma `select` payloads; keep in sync with orderAssignment*Select)
// -----------------------------------------------------------------------------

export type OrderAssignmentListRow = Prisma.OrderAssignmentGetPayload<{
  select: typeof orderAssignmentListSelect
}>

export type OrderAssignmentDetailRow = Prisma.OrderAssignmentGetPayload<{
  select: typeof orderAssignmentDetailSelect
}>

export type OrderExecutionActivityListRow = Prisma.OrderExecutionActivityGetPayload<{
  select: typeof orderExecutionActivityListSelect
}>

export type OrderExecutionActivityDetailRow = Prisma.OrderExecutionActivityGetPayload<{
  select: typeof orderExecutionActivityDetailSelect
}>

// -----------------------------------------------------------------------------
// Mappers
// -----------------------------------------------------------------------------

export function mapOrderAssignmentToListItemDTO(row: OrderAssignmentListRow): OrderAssignmentListItemDTO {
  return {
    id: row.id,
    orderId: row.orderId,
    orderType: row.orderType,
    status: row.status,
    warehouseId: row.warehouseId,
    warehouseName: row.warehouse.name,
    userId: row.userId,
    userFullName: row.user.fullName,
    assignedAt: row.assignedAt,
    startedAt: row.startedAt,
    pausedAt: row.pausedAt,
    releasedAt: row.releasedAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    timedOutAt: row.timedOutAt,
    isActive: row.isActive,
    notes: row.notes
  }
}

export function mapOrderAssignmentToDetailDTO(row: OrderAssignmentDetailRow): OrderAssignmentDetailDTO {
  return {
    id: row.id,
    orderId: row.orderId,
    orderType: row.orderType,
    status: row.status,
    warehouse: row.warehouse,
    user: row.user,
    assignedAt: row.assignedAt,
    startedAt: row.startedAt,
    pausedAt: row.pausedAt,
    releasedAt: row.releasedAt,
    completedAt: row.completedAt,
    cancelledAt: row.cancelledAt,
    timedOutAt: row.timedOutAt,
    isActive: row.isActive,
    notes: row.notes,
    zoneId: row.zoneId
  }
}

export function mapOrderExecutionActivityToListItemDTO(row: OrderExecutionActivityListRow): OrderExecutionActivityListItemDTO {
  return {
    id: row.id,
    orderAssignmentId: row.orderAssignmentId,
    orderId: row.orderId,
    orderType: row.orderType,
    orderLineRefId: row.orderLineRefId,
    warehouseId: row.warehouseId,
    zoneId: row.zoneId,
    warehouseName: row.warehouse.name,
    userId: row.userId,
    userFullName: row.user.fullName,
    activityType: row.activityType,
    notes: row.notes,
    createdAt: row.createdAt
  }
}

export function mapOrderExecutionActivityToDetailDTO(row: OrderExecutionActivityDetailRow): OrderExecutionActivityDetailDTO {
  return {
    id: row.id,
    orderAssignmentId: row.orderAssignmentId,
    orderId: row.orderId,
    orderType: row.orderType,
    orderLineRefId: row.orderLineRefId,
    zoneId: row.zoneId,
    activityType: row.activityType,
    notes: row.notes,
    createdAt: row.createdAt,
    user: row.user,
    warehouse: row.warehouse
  }
}

function mapOrderExecutionActivityToLatestDTO(row: OrderExecutionActivityListRow): LatestOrderExecutionActivityDTO {
  return {
    id: row.id,
    orderAssignmentId: row.orderAssignmentId,
    activityType: row.activityType,
    createdAt: row.createdAt,
    userId: row.userId,
    userFullName: row.user.fullName,
    notes: row.notes
  }
}

export function mapAssignmentWithLatestActivityDTO(
  assignment: OrderAssignmentListRow,
  latestActivity: OrderExecutionActivityListRow | null
): AssignmentLatestActivityDTO {
  return {
    assignment: mapOrderAssignmentToListItemDTO(assignment),
    latestActivity: latestActivity ? mapOrderExecutionActivityToLatestDTO(latestActivity) : null
  }
}

/**
 * Builds {@link OrderExecutionTimelineDTO} from assignment rows (e.g. `assignedAt` desc)
 * and all activity rows for the order (caller orders activities asc for stable bucketing).
 */
export function mapOrderExecutionTimelineDTO(
  orderId: string,
  orderType: OrderType,
  assignmentRows: OrderAssignmentListRow[],
  activityRows: OrderExecutionActivityListRow[]
): OrderExecutionTimelineDTO {
  const byAssignment = new Map<string, OrderExecutionActivityListItemDTO[]>()
  for (const a of assignmentRows) {
    byAssignment.set(a.id, [])
  }
  for (const row of activityRows) {
    const item = mapOrderExecutionActivityToListItemDTO(row)
    const bucket = byAssignment.get(item.orderAssignmentId)
    if (bucket) {
      bucket.push(item)
    }
  }

  const assignments: OrderExecutionTimelineGroupDTO[] = assignmentRows.map((row) => ({
    assignmentId: row.id,
    userId: row.userId,
    userFullName: row.user.fullName,
    status: row.status,
    assignedAt: row.assignedAt,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    activities: byAssignment.get(row.id) ?? []
  }))

  return { orderId, orderType, assignments }
}

// -----------------------------------------------------------------------------
// Small domain helpers
// -----------------------------------------------------------------------------

export function isExecutionActivityExceptionType(activityType: ExecutionActivity): boolean {
  return activityType === ExecutionActivity.EXCEPTION_RAISED || activityType === ExecutionActivity.EXCEPTION_RESOLVED
}

export function buildOrderExecutionDateRangeWhere(
  from: Date,
  to: Date
): Pick<Prisma.OrderExecutionActivityWhereInput, 'createdAt'> {
  return { createdAt: { gte: from, lte: to } }
}

export type OrderAssignmentDateRangeField =
  | 'assignedAt'
  | 'startedAt'
  | 'pausedAt'
  | 'releasedAt'
  | 'completedAt'
  | 'cancelledAt'
  | 'timedOutAt'

export function buildOrderAssignmentDateRangeWhere(
  field: OrderAssignmentDateRangeField,
  from: Date,
  to: Date
): Pick<Prisma.OrderAssignmentWhereInput, OrderAssignmentDateRangeField> {
  return { [field]: { gte: from, lte: to } } as Pick<Prisma.OrderAssignmentWhereInput, OrderAssignmentDateRangeField>
}
