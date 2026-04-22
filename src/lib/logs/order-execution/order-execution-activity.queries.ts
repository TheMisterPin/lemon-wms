import { ExecutionActivity, type OrderType, type PrismaClient } from '@/generated/prisma'
import {
  mapOrderExecutionActivityToDetailDTO,
  mapOrderExecutionActivityToListItemDTO,
  orderExecutionActivityDetailSelect,
  orderExecutionActivityListSelect,
  type OrderExecutionActivityListRow
} from './order-execution.helpers'
import type { OrderExecutionActivityDetailDTO, OrderExecutionActivityListItemDTO } from './order-execution.types'

export type { OrderExecutionActivityDetailDTO, OrderExecutionActivityListItemDTO } from './order-execution.types'

/** Newest first; deterministic. */
const ORDER_NEWEST: [{ createdAt: 'desc' }, { id: 'desc' }] = [{ createdAt: 'desc' }, { id: 'desc' }]

/** Oldest first (chronological timeline); deterministic. */
const ORDER_CHRONO_ASC: [{ createdAt: 'asc' }, { id: 'asc' }] = [{ createdAt: 'asc' }, { id: 'asc' }]

function toListDtos(rows: OrderExecutionActivityListRow[]): OrderExecutionActivityListItemDTO[] {
  return rows.map(mapOrderExecutionActivityToListItemDTO)
}

export async function getOrderExecutionActivityById(
  prisma: PrismaClient,
  id: string
): Promise<OrderExecutionActivityDetailDTO | null> {
  const row = await prisma.orderExecutionActivity.findUnique({
    where: { id },
    select: orderExecutionActivityDetailSelect
  })

  return row ? mapOrderExecutionActivityToDetailDTO(row) : null
}

export async function getLatestOrderExecutionActivityForAssignment(
  prisma: PrismaClient,
  orderAssignmentId: string
): Promise<OrderExecutionActivityDetailDTO | null> {
  const row = await prisma.orderExecutionActivity.findFirst({
    where: { orderAssignmentId },
    select: orderExecutionActivityDetailSelect,
    orderBy: ORDER_NEWEST
  })

  return row ? mapOrderExecutionActivityToDetailDTO(row) : null
}

export async function getLatestOrderExecutionActivityForOrder(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<OrderExecutionActivityDetailDTO | null> {
  const row = await prisma.orderExecutionActivity.findFirst({
    where: { orderType, orderId },
    select: orderExecutionActivityDetailSelect,
    orderBy: ORDER_NEWEST
  })

  return row ? mapOrderExecutionActivityToDetailDTO(row) : null
}

export async function getLatestOrderExecutionActivityForLine(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string,
  orderLineRefId: string
): Promise<OrderExecutionActivityDetailDTO | null> {
  const row = await prisma.orderExecutionActivity.findFirst({
    where: { orderType, orderId, orderLineRefId },
    select: orderExecutionActivityDetailSelect,
    orderBy: ORDER_NEWEST
  })

  return row ? mapOrderExecutionActivityToDetailDTO(row) : null
}

export async function getOrderExecutionActivitiesByAssignment(
  prisma: PrismaClient,
  orderAssignmentId: string
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: { orderAssignmentId },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getOrderExecutionActivitiesByAssignmentInRange(
  prisma: PrismaClient,
  orderAssignmentId: string,
  from: Date,
  to: Date
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: {
      orderAssignmentId,
      createdAt: { gte: from, lte: to }
    },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getOrderExecutionActivitiesByOrder(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: { orderType, orderId },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getOrderExecutionActivitiesByOrderInRange(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string,
  from: Date,
  to: Date
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: {
      orderType,
      orderId,
      createdAt: { gte: from, lte: to }
    },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getOrderExecutionActivitiesByLineRef(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string,
  orderLineRefId: string
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: { orderType, orderId, orderLineRefId },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getLineExecutionActivitiesInRange(
  prisma: PrismaClient,
  orderType: OrderType,
  orderId: string,
  orderLineRefId: string,
  from: Date,
  to: Date
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: {
      orderType,
      orderId,
      orderLineRefId,
      createdAt: { gte: from, lte: to }
    },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getOrderExecutionActivitiesByUser(
  prisma: PrismaClient,
  userId: string
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: { userId },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getOrderExecutionActivitiesByUserInRange(
  prisma: PrismaClient,
  userId: string,
  from: Date,
  to: Date
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: {
      userId,
      createdAt: { gte: from, lte: to }
    },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getOrderExecutionActivitiesByWarehouse(
  prisma: PrismaClient,
  warehouseId: string
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: { warehouseId },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getOrderExecutionActivitiesByWarehouseInRange(
  prisma: PrismaClient,
  warehouseId: string,
  from: Date,
  to: Date
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: {
      warehouseId,
      createdAt: { gte: from, lte: to }
    },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getOrderExecutionActivitiesByType(
  prisma: PrismaClient,
  activityType: ExecutionActivity
): Promise<OrderExecutionActivityListItemDTO[]> {
  const rows = await prisma.orderExecutionActivity.findMany({
    where: { activityType },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_NEWEST
  })

  return toListDtos(rows)
}

export async function getExceptionRaisedActivities(
  prisma: PrismaClient
): Promise<OrderExecutionActivityListItemDTO[]> {
  return getOrderExecutionActivitiesByType(prisma, ExecutionActivity.EXCEPTION_RAISED)
}

export async function getExceptionResolvedActivities(
  prisma: PrismaClient
): Promise<OrderExecutionActivityListItemDTO[]> {
  return getOrderExecutionActivitiesByType(prisma, ExecutionActivity.EXCEPTION_RESOLVED)
}

export async function getPackedActivities(prisma: PrismaClient): Promise<OrderExecutionActivityListItemDTO[]> {
  return getOrderExecutionActivitiesByType(prisma, ExecutionActivity.LINE_PACKED)
}

export async function getBoxedActivities(prisma: PrismaClient): Promise<OrderExecutionActivityListItemDTO[]> {
  return getOrderExecutionActivitiesByType(prisma, ExecutionActivity.LINE_BOXED)
}

export async function getPickedActivities(prisma: PrismaClient): Promise<OrderExecutionActivityListItemDTO[]> {
  return getOrderExecutionActivitiesByType(prisma, ExecutionActivity.LINE_PICKED)
}

export async function getReceivedActivities(prisma: PrismaClient): Promise<OrderExecutionActivityListItemDTO[]> {
  return getOrderExecutionActivitiesByType(prisma, ExecutionActivity.LINE_RECEIVED)
}

export async function getCheckedActivities(prisma: PrismaClient): Promise<OrderExecutionActivityListItemDTO[]> {
  return getOrderExecutionActivitiesByType(prisma, ExecutionActivity.LINE_CHECKED)
}

export async function getSkippedActivities(prisma: PrismaClient): Promise<OrderExecutionActivityListItemDTO[]> {
  return getOrderExecutionActivitiesByType(prisma, ExecutionActivity.LINE_SKIPPED)
}

export async function getReversedActivities(prisma: PrismaClient): Promise<OrderExecutionActivityListItemDTO[]> {
  return getOrderExecutionActivitiesByType(prisma, ExecutionActivity.LINE_REVERSED)
}

export async function getUserExecutionTrailForAssignment(
  prisma: PrismaClient,
  userId: string,
  orderAssignmentId: string
): Promise<OrderExecutionActivityListItemDTO[]> {
  const activityRows = await prisma.orderExecutionActivity.findMany({
    where: { userId, orderAssignmentId },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_CHRONO_ASC
  })

  return toListDtos(activityRows)
}

export async function getUserExecutionTrailForOrder(
  prisma: PrismaClient,
  userId: string,
  orderType: OrderType,
  orderId: string
): Promise<OrderExecutionActivityListItemDTO[]> {
  const activityRows = await prisma.orderExecutionActivity.findMany({
    where: { userId, orderType, orderId },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_CHRONO_ASC
  })

  return toListDtos(activityRows)
}

export async function getUserExecutionTrailInWarehouse(
  prisma: PrismaClient,
  userId: string,
  warehouseId: string
): Promise<OrderExecutionActivityListItemDTO[]> {
  const activityRows = await prisma.orderExecutionActivity.findMany({
    where: { userId, warehouseId },
    select: orderExecutionActivityListSelect,
    orderBy: ORDER_CHRONO_ASC
  })

  return toListDtos(activityRows)
}
