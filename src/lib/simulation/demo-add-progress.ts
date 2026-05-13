import {
  AssignmentLifecycle,
  BinOperationType,
  FiscalInventoryEventType,
  OrderStatus,
  OrderType,
  Prisma,
  ReceiptOutcome,
  ReceiptStatus,
  type PrismaClient
} from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { confirmPurchaseReceiptLineHandled } from '@/lib/orders/purchase/receipt/receipt-order-mutations'
import { getActiveReceiptForPurchaseOrder } from '@/lib/orders/purchase/receipt/receipt-order-queries'
import { pausePurchaseOrder } from '@/lib/orders/purchase/transition-purchase-order'
import { updateBinCapacityBy, upsertAvailableStockItem } from '@/lib/stock/stock-mutations'

export type DemoAddProgressRow = {
  purchaseOrderId: string
  reference: string
  ok: boolean
  message?: string
  assignedUserId?: string
  linesHandled?: number
}

export type DemoExecutingPurchaseOrder = {
  id: string
  reference: string
  warehouseId: string
}

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) {
    return undefined
  }

  return items[Math.floor(Math.random() * items.length)]
}

async function resolveWarehouseDeviceZone(prisma: PrismaClient, warehouseId: string): Promise<string | null> {
  const device = await prisma.device.findFirst({
    where: {
      warehouseId,
      authorized: true,
      isActive: true,
      zoneId: { not: null }
    },
    select: { zoneId: true }
  })

  return device?.zoneId ?? null
}

async function ensureExecutingAssignmentForWorker(
  prisma: PrismaClient,
  params: {
    purchaseOrderId: string
    warehouseId: string
    userId: string
    zoneId: string
  }
): Promise<string> {
  const now = new Date()

  await prisma.orderAssignment.updateMany({
    where: {
      orderId: params.purchaseOrderId,
      orderType: OrderType.PURCHASE,
      isActive: true
    },
    data: { isActive: false }
  })

  const existing = await prisma.orderAssignment.findFirst({
    where: {
      orderId: params.purchaseOrderId,
      orderType: OrderType.PURCHASE,
      userId: params.userId
    },
    select: { id: true, startedAt: true }
  })

  if (existing) {
    await prisma.orderAssignment.update({
      where: { id: existing.id },
      data: {
        status: AssignmentLifecycle.STARTED,
        isActive: true,
        warehouseId: params.warehouseId,
        zoneId: params.zoneId,
        pausedAt: null,
        releasedAt: null,
        cancelledAt: null,
        timedOutAt: null,
        assignedAt: now,
        startedAt: existing.startedAt ?? now
      }
    })

    return existing.id
  }

  const created = await prisma.orderAssignment.create({
    data: {
      orderId: params.purchaseOrderId,
      orderType: OrderType.PURCHASE,
      warehouseId: params.warehouseId,
      userId: params.userId,
      zoneId: params.zoneId,
      status: AssignmentLifecycle.STARTED,
      isActive: true,
      startedAt: now
    },
    select: { id: true }
  })

  return created.id
}

async function applyStockAfterReceiptLine(
  prisma: PrismaClient,
  params: {
    warehouseId: string
    purchaseOrderId: string
    userId: string
    itemId: string
    itemNameSnapshot: string
    uom: string
    toBinId: string
    quantityDelta: Prisma.Decimal
    binOperationEntryId: string
  }
): Promise<void> {
  const destBin = await prisma.bin.findUnique({
    where: { id: params.toBinId },
    select: { zoneId: true }
  })

  if (!destBin?.zoneId) {
    throw new DomainError('Destination bin not found.', 'NOT_FOUND', 404)
  }

  const catalogItem = await prisma.item.findUnique({
    where: { id: params.itemId },
    select: { sku: true }
  })
  const sku = catalogItem?.sku ?? ''
  const qtyNum = Number(params.quantityDelta.toString())

  await prisma.$transaction(async (tx) => {
    await upsertAvailableStockItem(tx, {
      warehouseId: params.warehouseId,
      binId: params.toBinId,
      itemId: params.itemId,
      name: params.itemNameSnapshot,
      sku,
      uom: params.uom,
      quantity: qtyNum,
      boeId: params.binOperationEntryId
    })
    await updateBinCapacityBy(tx, params.toBinId, qtyNum)
    await tx.itemLedgerEntry.create({
      data: {
        warehouseId: params.warehouseId,
        zoneId: destBin.zoneId,
        warItemId: params.itemId,
        orderId: params.purchaseOrderId,
        orderType: OrderType.PURCHASE,
        boeId: params.binOperationEntryId,
        eventType: FiscalInventoryEventType.RECEIPT,
        performedByUserId: params.userId,
        quantityDelta: params.quantityDelta,
        uom: params.uom
      }
    })
  })
}

export async function listExecutingPurchaseOrdersForDemo(
  prisma: PrismaClient
): Promise<DemoExecutingPurchaseOrder[]> {
  return prisma.purchaseOrder.findMany({
    where: { status: OrderStatus.EXECUTING, deletedAt: null },
    select: { id: true, reference: true, warehouseId: true },
    orderBy: { reference: 'asc' }
  })
}

export async function loadDemoFloorWorkers(prisma: PrismaClient): Promise<{ id: string }[]> {
  return prisma.user.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      role: { in: ['WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER'] },
      loginType: { in: ['BADGE_PIN', 'BOTH'] }
    },
    select: { id: true }
  })
}

export async function runDemoAddProgressForSingleExecutingOrder(
  prisma: PrismaClient,
  po: DemoExecutingPurchaseOrder,
  workers: { id: string }[]
): Promise<DemoAddProgressRow> {
  const worker = pickRandom(workers)
  if (!worker) {
    return {
      purchaseOrderId: po.id,
      reference: po.reference,
      ok: false,
      message: 'No worker picked.'
    }
  }

  try {
    const zoneId = await resolveWarehouseDeviceZone(prisma, po.warehouseId)
    if (!zoneId) {
      return {
        purchaseOrderId: po.id,
        reference: po.reference,
        ok: false,
        message: 'No authorized device with zone for this warehouse.'
      }
    }

    const bins = await prisma.bin.findMany({
      where: {
        zone: { warehouseId: po.warehouseId },
        isBlocked: false,
        deletedAt: null,
        OR: [{ currentCapacity: 0 }, { currentCapacity: null }]
      },
      select: { id: true },
      orderBy: { name: 'asc' }
    })

    const bin = pickRandom(bins)
    if (!bin) {
      return {
        purchaseOrderId: po.id,
        reference: po.reference,
        ok: false,
        message: 'No empty bin available.'
      }
    }

    const assignmentId = await ensureExecutingAssignmentForWorker(prisma, {
      purchaseOrderId: po.id,
      warehouseId: po.warehouseId,
      userId: worker.id,
      zoneId
    })

    const receipt = await getActiveReceiptForPurchaseOrder(prisma, po.id, po.warehouseId)
    if (!receipt) {
      return {
        purchaseOrderId: po.id,
        reference: po.reference,
        ok: false,
        message: 'No active receipt.',
        assignedUserId: worker.id
      }
    }

    const outstanding = receipt.lines.filter((l) => {
      const ordered = new Prisma.Decimal(l.orderedQuantity)
      const qty = new Prisma.Decimal(l.quantity)

      return ordered.minus(qty).gt(0)
    })

    if (outstanding.length === 0) {
      return {
        purchaseOrderId: po.id,
        reference: po.reference,
        ok: false,
        message: 'All receipt lines already fully handled.',
        assignedUserId: worker.id
      }
    }

    let linesToHandle: number
    if (outstanding.length === 1) {
      linesToHandle = 1
    } else {
      linesToHandle = 1 + Math.floor(Math.random() * (outstanding.length - 1))
    }

    const chosen = outstanding.slice(0, linesToHandle)
    let handled = 0
    let lineFailure: string | undefined

    for (const line of chosen) {
      const ordered = new Prisma.Decimal(line.orderedQuantity)
      const currentQty = new Prisma.Decimal(line.quantity)
      const increment = ordered.minus(currentQty)
      if (increment.lte(0)) {
        continue
      }

      const receiptLineMeta = await prisma.purchaseOrderReceiptLine.findUnique({
        where: { id: line.id },
        select: {
          itemId: true,
          receiptLine: {
            select: {
              status: true,
              warehouseId: true,
              purchaseOrderId: true
            }
          }
        }
      })

      if (!receiptLineMeta || receiptLineMeta.receiptLine.purchaseOrderId !== po.id) {
        continue
      }

      if (
        receiptLineMeta.receiptLine.status === ReceiptStatus.COMPLETED ||
        receiptLineMeta.receiptLine.status === ReceiptStatus.COMPLETED_WITH_PROBLEMS
      ) {
        lineFailure = 'Receipt completed during batch.'
        break
      }

      if (receiptLineMeta.receiptLine.status === ReceiptStatus.OPEN) {
        await prisma.purchaseOrderReceipt.updateMany({
          where: { id: receipt.id, status: ReceiptStatus.OPEN },
          data: {
            status: ReceiptStatus.IN_PROGRESS,
            startedById: worker.id,
            startedAt: new Date()
          }
        })
      }

      const confirm = await confirmPurchaseReceiptLineHandled(prisma, {
        receiptLineId: line.id,
        quantity: ordered,
        disposition: ReceiptOutcome.ACCEPTED,
        notes: 'Demo add-progress: receive remainder',
        orderAssignmentId: assignmentId,
        userId: worker.id,
        warehouseId: po.warehouseId,
        orderId: po.id,
        orderLineRefId: line.purchaseOrderLineId,
        activityNotes: null,
        stockMove: {
          binOperation: {
            userId: worker.id,
            warehouseId: po.warehouseId,
            zoneId,
            type: BinOperationType.RECEIVE,
            toBinId: bin.id,
            warItemId: line.itemId,
            quantity: increment,
            uom: line.uom,
            orderId: po.id,
            orderType: OrderType.PURCHASE,
            affectsFiscalStock: true
          }
        }
      })

      if (!confirm.success) {
        lineFailure = confirm.error
        break
      }

      if (confirm.binOperationEntryId) {
        await applyStockAfterReceiptLine(prisma, {
          warehouseId: po.warehouseId,
          purchaseOrderId: po.id,
          userId: worker.id,
          itemId: line.itemId,
          itemNameSnapshot: line.itemNameSnapshot,
          uom: line.uom,
          toBinId: bin.id,
          quantityDelta: increment,
          binOperationEntryId: confirm.binOperationEntryId
        })
      }

      handled += 1
    }

    if (lineFailure !== undefined) {
      return {
        purchaseOrderId: po.id,
        reference: po.reference,
        ok: false,
        message: lineFailure,
        assignedUserId: worker.id,
        linesHandled: handled
      }
    }

    if (handled === 0) {
      return {
        purchaseOrderId: po.id,
        reference: po.reference,
        ok: false,
        message: 'No receipt lines were updated.',
        assignedUserId: worker.id,
        linesHandled: 0
      }
    }

    const paused = await pausePurchaseOrder(prisma, po.id, po.warehouseId, worker.id)

    return {
      purchaseOrderId: po.id,
      reference: po.reference,
      ok: true,
      assignedUserId: worker.id,
      linesHandled: handled,
      message: `Paused (${paused.status}); handled ${handled} line(s).`
    }
  } catch (err) {
    const message =
      err instanceof DomainError ? err.message :
        err instanceof Error ? err.message :
          'Unexpected error.'

    return {
      purchaseOrderId: po.id,
      reference: po.reference,
      ok: false,
      message,
      assignedUserId: worker.id
    }
  }
}

export async function runDemoAddProgressForExecutingPurchaseOrders(
  prisma: PrismaClient
): Promise<DemoAddProgressRow[]> {
  const executingOrders = await listExecutingPurchaseOrdersForDemo(prisma)
  const workers = await loadDemoFloorWorkers(prisma)

  if (workers.length === 0) {
    return executingOrders.map((o) => ({
      purchaseOrderId: o.id,
      reference: o.reference,
      ok: false,
      message: 'No eligible warehouse workers found for demo.'
    }))
  }

  const results: DemoAddProgressRow[] = []

  for (const po of executingOrders) {
    results.push(await runDemoAddProgressForSingleExecutingOrder(prisma, po, workers))
  }

  return results
}
