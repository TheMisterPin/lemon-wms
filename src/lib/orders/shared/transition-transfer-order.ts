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

const NOT_FOUND = 'Transfer order not found.'
const INVALID_START = 'Transfer order cannot be started in its current state.'
const INVALID_PAUSE = 'Transfer order cannot be paused in its current state.'
const INVALID_RESUME = 'Transfer order cannot be resumed in its current state.'

async function loadActiveTransferOrder(prisma: PrismaClient, id: string): Promise<OperationalOrderScopeRow> {
  const row = await prisma.transferOrder.findFirst({
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
    throw new DomainError(NOT_FOUND, 'NOT_FOUND', 404)
  }

  return row
}

export type TransitionedTransferOrder = {
  id: string
  status: OrderStatus
}

export type StartedTransferOrder = {
  id: string
  status: OrderStatus
  orderAssignmentId: string
}

export async function startTransferOrder(
  prisma: PrismaClient,
  id: string,
  tokenWarehouseId: string,
  userId: string,
  zoneId?: string | null
): Promise<StartedTransferOrder> {
  const row = await loadActiveTransferOrder(prisma, id)
  assertOperationalWarehouseMatch(row, tokenWarehouseId)
  if (row.status !== OrderStatus.RELEASED) {
    throw new DomainError(INVALID_START, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.transferOrder.updateMany({
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
      orderType: OrderType.TRANSFER
    })

    const assignmentId = await activateOperationalOrderAssignmentForUserInTx(tx, {
      orderType: OrderType.TRANSFER,
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

export async function pauseTransferOrder(
  prisma: PrismaClient,
  id: string,
  tokenWarehouseId: string,
  userId: string
): Promise<TransitionedTransferOrder> {
  const row = await loadActiveTransferOrder(prisma, id)
  assertOperationalWarehouseMatch(row, tokenWarehouseId)
  if (row.status !== OrderStatus.EXECUTING) {
    throw new DomainError(INVALID_PAUSE, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.transferOrder.updateMany({
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
      orderType: OrderType.TRANSFER
    })

    return updated
  })
  if (result.count === 0) {
    throw new DomainError(INVALID_PAUSE, 'INVALID_TRANSITION', 409)
  }

  return { id, status: OrderStatus.PAUSED }
}

export async function resumeTransferOrder(
  prisma: PrismaClient,
  id: string,
  tokenWarehouseId: string,
  userId: string,
  zoneId?: string | null
): Promise<StartedTransferOrder> {
  const row = await loadActiveTransferOrder(prisma, id)
  assertOperationalWarehouseMatch(row, tokenWarehouseId)
  if (row.status !== OrderStatus.PAUSED) {
    throw new DomainError(INVALID_RESUME, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.transferOrder.updateMany({
      where: { id, status: OrderStatus.PAUSED, deletedAt: null },
      data: { status: OrderStatus.EXECUTING }
    })
    if (updated.count === 0) {
      return null
    }

    await tx.orderAssignment.updateMany({
      where: { orderType: OrderType.TRANSFER, orderId: id },
      data: { isActive: false }
    })

    await writeOperationalOrderLifecycleLog(tx, {
      userId,
      actionType: LOG_ACTION_TYPES.ORDER_RESUMED,
      row,
      orderType: OrderType.TRANSFER
    })

    const assignmentId = await activateOperationalOrderAssignmentForUserInTx(tx, {
      orderType: OrderType.TRANSFER,
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
