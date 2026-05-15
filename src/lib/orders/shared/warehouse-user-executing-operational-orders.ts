import type { PrismaClient } from '@/generated/prisma'
import { OrderStatus, OrderType } from '@/generated/prisma'

import { pausePurchaseOrder } from '@/lib/orders/purchase'
import { pauseSalesOrder } from '@/lib/orders/shared/transition-sales-order'
import { pauseTransferOrder } from '@/lib/orders/shared/transition-transfer-order'

export type OperationalOrderRef = {
  orderType: OrderType
  orderId: string
}

export type OperationalOrderRefWithReference = OperationalOrderRef & {
  reference: string
}

/**
 * Lists operational orders (purchase / sales / transfer) the user is executing
 * in this warehouse (active assignment + master order status EXECUTING).
 */
export async function listUserExecutingOperationalOrderRefs(
  prisma: PrismaClient,
  userId: string,
  warehouseId: string
): Promise<OperationalOrderRef[]> {
  const assignments = await prisma.orderAssignment.findMany({
    where: {
      userId,
      warehouseId,
      isActive: true,
      orderType: { in: [OrderType.PURCHASE, OrderType.SALES, OrderType.TRANSFER] }
    },
    select: {
      orderId: true,
      orderType: true
    }
  })

  if (assignments.length === 0) {
    return []
  }

  const purchaseIds = assignments
    .filter((row) => row.orderType === OrderType.PURCHASE)
    .map((row) => row.orderId)
  const salesIds = assignments
    .filter((row) => row.orderType === OrderType.SALES)
    .map((row) => row.orderId)
  const transferIds = assignments
    .filter((row) => row.orderType === OrderType.TRANSFER)
    .map((row) => row.orderId)

  const [purchaseExecuting, salesExecuting, transferExecuting] = await Promise.all([
    purchaseIds.length === 0
      ? Promise.resolve([] as { id: string }[])
      : prisma.purchaseOrder.findMany({
        where: {
          id: { in: purchaseIds },
          deletedAt: null,
          status: OrderStatus.EXECUTING
        },
        select: { id: true }
      }),
    salesIds.length === 0
      ? Promise.resolve([] as { id: string }[])
      : prisma.salesOrder.findMany({
        where: {
          id: { in: salesIds },
          deletedAt: null,
          status: OrderStatus.EXECUTING
        },
        select: { id: true }
      }),
    transferIds.length === 0
      ? Promise.resolve([] as { id: string }[])
      : prisma.transferOrder.findMany({
        where: {
          id: { in: transferIds },
          deletedAt: null,
          status: OrderStatus.EXECUTING
        },
        select: { id: true }
      })
  ])

  const purchaseSet = new Set(purchaseExecuting.map((row) => row.id))
  const salesSet = new Set(salesExecuting.map((row) => row.id))
  const transferSet = new Set(transferExecuting.map((row) => row.id))

  const refs: OperationalOrderRef[] = []

  for (const assignment of assignments) {
    if (assignment.orderType === OrderType.PURCHASE && purchaseSet.has(assignment.orderId)) {
      refs.push({ orderType: OrderType.PURCHASE, orderId: assignment.orderId })
      continue
    }
    if (assignment.orderType === OrderType.SALES && salesSet.has(assignment.orderId)) {
      refs.push({ orderType: OrderType.SALES, orderId: assignment.orderId })
      continue
    }
    if (assignment.orderType === OrderType.TRANSFER && transferSet.has(assignment.orderId)) {
      refs.push({ orderType: OrderType.TRANSFER, orderId: assignment.orderId })
    }
  }

  return refs
}

export async function operationalOrderReferences(
  prisma: PrismaClient,
  refs: OperationalOrderRef[]
): Promise<OperationalOrderRefWithReference[]> {
  if (refs.length === 0) {
    return []
  }

  const purchaseIds = refs.filter((r) => r.orderType === OrderType.PURCHASE).map((r) => r.orderId)
  const salesIds = refs.filter((r) => r.orderType === OrderType.SALES).map((r) => r.orderId)
  const transferIds = refs.filter((r) => r.orderType === OrderType.TRANSFER).map((r) => r.orderId)

  const [purchases, sales, transfers] = await Promise.all([
    purchaseIds.length === 0
      ? Promise.resolve([] as { id: string; reference: string }[])
      : prisma.purchaseOrder.findMany({
        where: { id: { in: purchaseIds }, deletedAt: null },
        select: { id: true, reference: true }
      }),
    salesIds.length === 0
      ? Promise.resolve([] as { id: string; reference: string }[])
      : prisma.salesOrder.findMany({
        where: { id: { in: salesIds }, deletedAt: null },
        select: { id: true, reference: true }
      }),
    transferIds.length === 0
      ? Promise.resolve([] as { id: string; reference: string }[])
      : prisma.transferOrder.findMany({
        where: { id: { in: transferIds }, deletedAt: null },
        select: { id: true, reference: true }
      })
  ])

  const purchaseRefById = new Map(purchases.map((row) => [row.id, row.reference]))
  const salesRefById = new Map(sales.map((row) => [row.id, row.reference]))
  const transferRefById = new Map(transfers.map((row) => [row.id, row.reference]))

  return refs.map((ref) => {
    const reference =
      ref.orderType === OrderType.PURCHASE
        ? purchaseRefById.get(ref.orderId)
        : ref.orderType === OrderType.SALES
          ? salesRefById.get(ref.orderId)
          : transferRefById.get(ref.orderId)

    return {
      ...ref,
      reference: reference ?? ref.orderId
    }
  })
}

export async function pauseOperationalOrderForFloorUser(
  prisma: PrismaClient,
  ref: OperationalOrderRef,
  warehouseId: string,
  userId: string
): Promise<void> {
  if (ref.orderType === OrderType.PURCHASE) {
    await pausePurchaseOrder(prisma, ref.orderId, warehouseId, userId)

    return
  }
  if (ref.orderType === OrderType.SALES) {
    await pauseSalesOrder(prisma, ref.orderId, warehouseId, userId)

    return
  }

  await pauseTransferOrder(prisma, ref.orderId, warehouseId, userId)
}

/**
 * Pauses every executing operational order this user holds in the warehouse.
 */
export async function pauseAllUserExecutingOperationalOrders(
  prisma: PrismaClient,
  userId: string,
  warehouseId: string
): Promise<void> {
  const refs = await listUserExecutingOperationalOrderRefs(prisma, userId, warehouseId)

  for (const ref of refs) {
    await pauseOperationalOrderForFloorUser(prisma, ref, warehouseId, userId)
  }
}
