import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'

const PO_NOT_FOUND = 'Purchase order not found.'

const INVALID_RELEASE =
  'Purchase order cannot be released in its current state.'
const INVALID_START =
  'Purchase order cannot be started in its current state.'
const INVALID_PAUSE =
  'Purchase order cannot be paused in its current state.'
const INVALID_RESUME =
  'Purchase order cannot be resumed in its current state.'

const WAREHOUSE_MISMATCH =
  'This purchase order does not belong to your warehouse.'

type PoScopeRow = {
  id: string
  status: OrderStatus
  deletedAt: Date | null
  warehouseId: string
}

/**
 * Loads a single purchase order and rejects soft-deleted/missing records.
 * This gives all transition operations a shared, consistent starting point.
 */
async function loadActivePurchaseOrder(
  prisma: PrismaClient,
  id: string
): Promise<PoScopeRow> {
  const row = await prisma.purchaseOrder.findFirst({
    where: { id },
    select: {
      id: true,
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

/**
 * Enforces warehouse ownership for floor-side transitions.
 * Warehouse users can only control orders belonging to their own warehouse.
 */
function assertWarehouseMatch(row: PoScopeRow, tokenWarehouseId: string) {
  if (row.warehouseId !== tokenWarehouseId) {
    throw new DomainError(WAREHOUSE_MISMATCH, 'FORBIDDEN', 403)
  }
}

export type TransitionedPurchaseOrder = {
  id: string
  status: OrderStatus
}

/**
 * Releases a draft purchase order so warehouse teams can see and act on it.
 * Allowed transition: DRAFT -> RELEASED.
 */
export async function releasePurchaseOrder(
  prisma: PrismaClient,
  id: string
): Promise<TransitionedPurchaseOrder> {
  const row = await loadActivePurchaseOrder(prisma, id)
  if (row.status !== OrderStatus.DRAFT) {
    throw new DomainError(INVALID_RELEASE, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.purchaseOrder.updateMany({
    where: { id, status: OrderStatus.DRAFT, deletedAt: null },
    data: { status: OrderStatus.RELEASED }
  })
  if (result.count === 0) {
    throw new DomainError(INVALID_RELEASE, 'INVALID_TRANSITION', 409)
  }

  return { id, status: OrderStatus.RELEASED }
}

/**
 * Starts operational execution of a released purchase order.
 * Allowed transition: RELEASED -> EXECUTING.
 */
export async function startPurchaseOrder(
  prisma: PrismaClient,
  id: string,
  tokenWarehouseId: string
): Promise<TransitionedPurchaseOrder> {
  const row = await loadActivePurchaseOrder(prisma, id)
  assertWarehouseMatch(row, tokenWarehouseId)
  if (row.status !== OrderStatus.RELEASED) {
    throw new DomainError(INVALID_START, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.purchaseOrder.updateMany({
    where: { id, status: OrderStatus.RELEASED, deletedAt: null },
    data: { status: OrderStatus.EXECUTING }
  })
  if (result.count === 0) {
    throw new DomainError(INVALID_START, 'INVALID_TRANSITION', 409)
  }

  return { id, status: OrderStatus.EXECUTING }
}

/**
 * Pauses an order that is currently being executed on the floor.
 * Allowed transition: EXECUTING -> PAUSED.
 */
export async function pausePurchaseOrder(
  prisma: PrismaClient,
  id: string,
  tokenWarehouseId: string
): Promise<TransitionedPurchaseOrder> {
  const row = await loadActivePurchaseOrder(prisma, id)
  assertWarehouseMatch(row, tokenWarehouseId)
  if (row.status !== OrderStatus.EXECUTING) {
    throw new DomainError(INVALID_PAUSE, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.purchaseOrder.updateMany({
    where: { id, status: OrderStatus.EXECUTING, deletedAt: null },
    data: { status: OrderStatus.PAUSED }
  })
  if (result.count === 0) {
    throw new DomainError(INVALID_PAUSE, 'INVALID_TRANSITION', 409)
  }

  return { id, status: OrderStatus.PAUSED }
}

/**
 * Resumes a previously paused warehouse execution flow.
 * Allowed transition: PAUSED -> EXECUTING.
 */
export async function resumePurchaseOrder(
  prisma: PrismaClient,
  id: string,
  tokenWarehouseId: string
): Promise<TransitionedPurchaseOrder> {
  const row = await loadActivePurchaseOrder(prisma, id)
  assertWarehouseMatch(row, tokenWarehouseId)
  if (row.status !== OrderStatus.PAUSED) {
    throw new DomainError(INVALID_RESUME, 'INVALID_TRANSITION', 409)
  }
  const result = await prisma.purchaseOrder.updateMany({
    where: { id, status: OrderStatus.PAUSED, deletedAt: null },
    data: { status: OrderStatus.EXECUTING }
  })
  if (result.count === 0) {
    throw new DomainError(INVALID_RESUME, 'INVALID_TRANSITION', 409)
  }

  return { id, status: OrderStatus.EXECUTING }
}
