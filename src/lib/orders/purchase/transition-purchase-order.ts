import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus, OrderType } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { LOG_ACTION_TYPES } from '@/lib/logs'
import {
  activateOperationalOrderAssignmentForUserInTx,
  assertOperationalWarehouseMatch,
  type OperationalOrderScopeRow,
  writeOperationalOrderLifecycleLog
} from '@/lib/orders/shared/operational-order-transition-helpers'

const PO_NOT_FOUND = 'Purchase order not found.'

const INVALID_RELEASE =
  'Purchase order cannot be released in its current state.'
const INVALID_START =
  'Purchase order cannot be started in its current state.'
const INVALID_PAUSE =
  'Purchase order cannot be paused in its current state.'
const INVALID_RESUME =
  'Purchase order cannot be resumed in its current state.'

type PoScopeRow = OperationalOrderScopeRow

async function loadActivePurchaseOrder(
  prisma: PrismaClient,
  id: string
): Promise<PoScopeRow> {
  const row = await prisma.purchaseOrder.findFirst({
    where: { id },
    select: {
      id: true,
      reference: true,
      status: true,
      deletedAt: true,
      warehouseId: true
    }
  })
  if (!row || row.deletedAt) {
    throw new DomainError(PO_NOT_FOUND, 'NOT_FOUND', 404)
  }

  return row
}

export type TransitionedPurchaseOrder = {
  id: string
  status: OrderStatus
}

export type StartedPurchaseOrder = {
  id: string
  status: OrderStatus
  orderAssignmentId: string
}

export async function releasePurchaseOrder(
  prisma: PrismaClient,
  id: string,
  userId: string
): Promise<TransitionedPurchaseOrder> {
  const row = await loadActivePurchaseOrder(prisma, id)
  if (row.status !== OrderStatus.DRAFT) {
    throw new DomainError(INVALID_RELEASE, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.purchaseOrder.updateMany({
      where: { id, status: OrderStatus.DRAFT, deletedAt: null },
      data: { status: OrderStatus.RELEASED }
    })
    if (updated.count === 0) {
      return updated
    }

    await writeOperationalOrderLifecycleLog(tx, {
      userId,
      actionType: LOG_ACTION_TYPES.ORDER_CONFIRMED,
      row,
      orderType: OrderType.PURCHASE
    })

    return updated
  })
  if (result.count === 0) {
    throw new DomainError(INVALID_RELEASE, 'INVALID_TRANSITION', 409)
  }

  return { id, status: OrderStatus.RELEASED }
}

export async function startPurchaseOrder(
  prisma: PrismaClient,
  id: string,
  tokenWarehouseId: string,
  userId: string,
  zoneId?: string | null
): Promise<StartedPurchaseOrder> {
  const row = await loadActivePurchaseOrder(prisma, id)
  assertOperationalWarehouseMatch(row, tokenWarehouseId)
  if (row.status !== OrderStatus.RELEASED) {
    throw new DomainError(INVALID_START, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.purchaseOrder.updateMany({
      where: { id, status: OrderStatus.RELEASED, deletedAt: null },
      data: { status: OrderStatus.EXECUTING }
    })
    if (updated.count === 0) {
      return null
    }

    await writeOperationalOrderLifecycleLog(tx, {
      userId,
      actionType: LOG_ACTION_TYPES.ORDER_STARTED,
      row,
      orderType: OrderType.PURCHASE
    })

    const assignmentId = await activateOperationalOrderAssignmentForUserInTx(tx, {
      orderType: OrderType.PURCHASE,
      orderId: id,
      tokenWarehouseId,
      userId,
      zoneId
    })

    return { assignmentId }
  })

  if (result === null) {
    throw new DomainError(INVALID_START, 'INVALID_TRANSITION', 409)
  }

  return { id, status: OrderStatus.EXECUTING, orderAssignmentId: result.assignmentId }
}

export async function pausePurchaseOrder(
  prisma: PrismaClient,
  id: string,
  tokenWarehouseId: string,
  userId: string
): Promise<TransitionedPurchaseOrder> {
  const row = await loadActivePurchaseOrder(prisma, id)
  assertOperationalWarehouseMatch(row, tokenWarehouseId)
  if (row.status !== OrderStatus.EXECUTING) {
    throw new DomainError(INVALID_PAUSE, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.purchaseOrder.updateMany({
      where: { id, status: OrderStatus.EXECUTING, deletedAt: null },
      data: { status: OrderStatus.PAUSED }
    })
    if (updated.count === 0) {
      return updated
    }

    await writeOperationalOrderLifecycleLog(tx, {
      userId,
      actionType: LOG_ACTION_TYPES.ORDER_PAUSED,
      row,
      orderType: OrderType.PURCHASE
    })

    return updated
  })
  if (result.count === 0) {
    throw new DomainError(INVALID_PAUSE, 'INVALID_TRANSITION', 409)
  }

  return { id, status: OrderStatus.PAUSED }
}

export async function resumePurchaseOrder(
  prisma: PrismaClient,
  id: string,
  tokenWarehouseId: string,
  userId: string,
  zoneId?: string | null
): Promise<StartedPurchaseOrder> {
  const row = await loadActivePurchaseOrder(prisma, id)
  assertOperationalWarehouseMatch(row, tokenWarehouseId)
  if (row.status !== OrderStatus.PAUSED) {
    throw new DomainError(INVALID_RESUME, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.purchaseOrder.updateMany({
      where: { id, status: OrderStatus.PAUSED, deletedAt: null },
      data: { status: OrderStatus.EXECUTING }
    })
    if (updated.count === 0) {
      return null
    }

    await tx.orderAssignment.updateMany({
      where: { orderType: OrderType.PURCHASE, orderId: id },
      data: { isActive: false }
    })

    await writeOperationalOrderLifecycleLog(tx, {
      userId,
      actionType: LOG_ACTION_TYPES.ORDER_RESUMED,
      row,
      orderType: OrderType.PURCHASE
    })

    const assignmentId = await activateOperationalOrderAssignmentForUserInTx(tx, {
      orderType: OrderType.PURCHASE,
      orderId: id,
      tokenWarehouseId,
      userId,
      zoneId
    })

    return { assignmentId }
  })

  if (result === null) {
    throw new DomainError(INVALID_RESUME, 'INVALID_TRANSITION', 409)
  }

  return { id, status: OrderStatus.EXECUTING, orderAssignmentId: result.assignmentId }
}
