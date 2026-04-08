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

function assertWarehouseMatch(row: PoScopeRow, tokenWarehouseId: string) {
  if (row.warehouseId !== tokenWarehouseId) {
    throw new DomainError(WAREHOUSE_MISMATCH, 'FORBIDDEN', 403)
  }
}

export type TransitionedPurchaseOrder = {
  id: string
  status: OrderStatus
}

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
