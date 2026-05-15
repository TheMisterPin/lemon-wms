import type { Prisma, PrismaClient } from '@/generated/prisma'
import { AssignmentLifecycle, OrderStatus, OrderType } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { createUserActivityEntry, LOG_ACTION_TYPES } from '@/lib/logs'

export type OperationalOrderScopeRow = {
  id: string
  reference: string
  status: OrderStatus
  deletedAt: Date | null
  warehouseId: string
}

export const OPERATIONAL_WAREHOUSE_MISMATCH = 'This order does not belong to your warehouse.'

export function assertOperationalWarehouseMatch(row: OperationalOrderScopeRow, tokenWarehouseId: string): void {
  if (row.warehouseId !== tokenWarehouseId) {
    throw new DomainError(OPERATIONAL_WAREHOUSE_MISMATCH, 'FORBIDDEN', 403)
  }
}

type OperationalLifecycleLogParams = {
  userId: string
  actionType: (typeof LOG_ACTION_TYPES)[keyof typeof LOG_ACTION_TYPES]
  row: Pick<OperationalOrderScopeRow, 'id' | 'reference' | 'warehouseId'>
  orderType: OrderType
}

export async function writeOperationalOrderLifecycleLog(
  prisma: PrismaClient | Prisma.TransactionClient,
  params: OperationalLifecycleLogParams
): Promise<void> {
  const { userId, actionType, row, orderType } = params

  await createUserActivityEntry({
    prisma,
    userId,
    actionType,
    entityType: 'ORDER',
    entityId: row.id,
    warehouseId: row.warehouseId,
    orderId: row.id,
    orderType,
    metadata: {
      orderType,
      reference: row.reference
    }
  })
}

type ActivateAssignmentParams = {
  orderType: OrderType
  orderId: string
  tokenWarehouseId: string
  userId: string
  zoneId?: string | null
}

/**
 * Ensures the worker has an active STARTED assignment for this operational order.
 */
export async function activateOperationalOrderAssignmentForUserInTx(
  tx: Prisma.TransactionClient,
  params: ActivateAssignmentParams
): Promise<string> {
  const { orderType, orderId, tokenWarehouseId, userId, zoneId } = params
  const now = new Date()
  const existing = await tx.orderAssignment.findFirst({
    where: { orderType, orderId, userId }
  })

  if (existing) {
    const refreshed = await tx.orderAssignment.update({
      where: { id: existing.id },
      data: {
        status: AssignmentLifecycle.STARTED,
        warehouseId: tokenWarehouseId,
        zoneId: zoneId ?? existing.zoneId,
        isActive: true,
        assignedAt: now,
        startedAt: now,
        pausedAt: null,
        releasedAt: null,
        completedAt: null,
        cancelledAt: null,
        timedOutAt: null
      }
    })

    return refreshed.id
  }

  const created = await tx.orderAssignment.create({
    data: {
      orderId,
      orderType,
      warehouseId: tokenWarehouseId,
      userId,
      zoneId: zoneId ?? null,
      status: AssignmentLifecycle.STARTED,
      isActive: true,
      startedAt: now
    }
  })

  return created.id
}
