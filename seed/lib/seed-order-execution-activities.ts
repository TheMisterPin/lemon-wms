import {
  AssignmentLifecycle,
  ExecutionActivity,
  OrderExecutionLineDocument,
  OrderType,
  Prisma,
  ReceiptOutcome,
  type PrismaClient
} from '@/generated/prisma'

import { confirmPurchaseReceiptLineHandled } from '@/lib/orders/purchase/receipt/receipt-order-mutations'
import { confirmSalesPickLineHandled } from '@/lib/orders/sales/sales-pick/sales-pick-mutations'
import {
  recomputePurchaseOrderReceiptRollups,
  recomputeSalesOrderPickRollups,
  recomputeTransferOrderPickRollups
} from '@/lib/orders/shared/execution-document-rollups'
import { toQty } from '@/lib/orders/shared/pick-line-progress'
import { confirmTransferPickLineHandled } from '@/lib/orders/transfer/transfer-pick/transfer-pick-mutations'

const LINES_PER_ORDER = 2

function seededPartialQuantity(ordered: Prisma.Decimal, slot: number): Prisma.Decimal {
  const o = ordered.toNumber()
  if (o <= 0) {
    return new Prisma.Decimal(0)
  }

  const factors = [0.45, 0.72]
  const raw = Math.round(o * factors[slot % factors.length] * 100) / 100
  const q = Math.max(raw < o ? Math.max(raw, 1) : raw, 0)

  return new Prisma.Decimal(Math.min(q, o))
}

function canUseExecutionMutations(status: AssignmentLifecycle): boolean {
  return status === AssignmentLifecycle.STARTED || status === AssignmentLifecycle.RESUMED
}

export async function seedOrderExecutionActivities(prisma: PrismaClient): Promise<{
  linesTouched: number
  mutationCalls: number
  directWrites: number
}> {
  const assignments = await prisma.orderAssignment.findMany({
    where: {
      isActive: true,
      zoneId: { not: null },
      status: {
        in: [
          AssignmentLifecycle.ASSIGNED,
          AssignmentLifecycle.STARTED,
          AssignmentLifecycle.PAUSED,
          AssignmentLifecycle.RESUMED
        ]
      }
    },
    orderBy: { assignedAt: 'asc' },
    select: {
      id: true,
      orderId: true,
      orderType: true,
      userId: true,
      warehouseId: true,
      zoneId: true,
      status: true
    }
  })

  let linesTouched = 0
  let mutationCalls = 0
  let directWrites = 0

  for (const asg of assignments) {
    const zoneId = asg.zoneId
    if (!zoneId) {
      continue
    }

    if (asg.orderType === OrderType.PURCHASE) {
      const receiptLines = await prisma.purchaseOrderReceiptLine.findMany({
        where: {
          correctionOfLineId: null,
          purchaseOrderLine: { purchaseOrderId: asg.orderId }
        },
        orderBy: { createdAt: 'asc' },
        take: LINES_PER_ORDER,
        select: {
          id: true,
          purchaseOrderLineId: true,
          orderedQuantity: true,
          purchaseOrderReceiptId: true
        }
      })

      let slot = 0
      for (const rl of receiptLines) {
        const quantity = seededPartialQuantity(rl.orderedQuantity, slot)
        slot += 1
        if (quantity.toNumber() === 0) {
          continue
        }

        if (canUseExecutionMutations(asg.status)) {
          const result = await confirmPurchaseReceiptLineHandled(prisma, {
            receiptLineId: rl.id,
            quantity,
            disposition: ReceiptOutcome.ACCEPTED,
            orderAssignmentId: asg.id,
            userId: asg.userId,
            warehouseId: asg.warehouseId,
            orderId: asg.orderId,
            orderLineRefId: rl.purchaseOrderLineId,
            activityNotes: 'Seeded execution activity'
          })

          if (result.success) {
            mutationCalls += 1
            linesTouched += 1
          } else {
            console.warn(`[seed] confirmPurchaseReceiptLineHandled failed: ${result.error}`)
          }
        } else {
          await prisma.$transaction(async (tx) => {
            await tx.purchaseOrderReceiptLine.update({
              where: { id: rl.id },
              data: {
                quantity,
                disposition: ReceiptOutcome.ACCEPTED
              }
            })
            await recomputePurchaseOrderReceiptRollups(tx, rl.purchaseOrderReceiptId)
            await tx.orderExecutionActivity.create({
              data: {
                orderAssignmentId: asg.id,
                userId: asg.userId,
                warehouseId: asg.warehouseId,
                zoneId,
                orderId: asg.orderId,
                orderType: OrderType.PURCHASE,
                orderLineRefId: rl.purchaseOrderLineId,
                executionLineDocument: OrderExecutionLineDocument.PURCHASE_RECEIPT_LINE,
                executionLineId: rl.id,
                activityType: ExecutionActivity.LINE_RECEIVED,
                notes: 'Seeded execution (session not STARTED/RESUMED)'
              }
            })
          })
          directWrites += 1
          linesTouched += 1
        }
      }
    }

    if (asg.orderType === OrderType.SALES) {
      const pickLines = await prisma.salesOrderPickLine.findMany({
        where: {
          correctionOfLineId: null,
          salesOrderLine: { salesOrderId: asg.orderId }
        },
        orderBy: { createdAt: 'asc' },
        take: LINES_PER_ORDER,
        select: {
          id: true,
          salesOrderLineId: true,
          orderedQuantity: true,
          salesOrderPickId: true
        }
      })

      let slot = 0
      for (const pl of pickLines) {
        const quantity = seededPartialQuantity(pl.orderedQuantity, slot)
        slot += 1
        if (quantity.toNumber() === 0) {
          continue
        }

        if (canUseExecutionMutations(asg.status)) {
          const result = await confirmSalesPickLineHandled(prisma, {
            pickLineId: pl.id,
            quantity,
            disposition: ReceiptOutcome.ACCEPTED,
            orderAssignmentId: asg.id,
            userId: asg.userId,
            warehouseId: asg.warehouseId,
            activityNotes: 'Seeded execution activity'
          })

          if (result.success) {
            mutationCalls += 1
            linesTouched += 1
          } else {
            console.warn(`[seed] confirmSalesPickLineHandled failed: ${result.error}`)
          }
        } else {
          const activity =
            toQty(quantity) >= toQty(pl.orderedQuantity)
              ? ExecutionActivity.LINE_PICKED
              : ExecutionActivity.LINE_PARTIALLY_PICKED

          await prisma.$transaction(async (tx) => {
            await tx.salesOrderPickLine.update({
              where: { id: pl.id },
              data: {
                quantity,
                disposition: ReceiptOutcome.ACCEPTED
              }
            })
            await recomputeSalesOrderPickRollups(tx, pl.salesOrderPickId)
            await tx.orderExecutionActivity.create({
              data: {
                orderAssignmentId: asg.id,
                userId: asg.userId,
                warehouseId: asg.warehouseId,
                zoneId,
                orderId: asg.orderId,
                orderType: OrderType.SALES,
                orderLineRefId: pl.salesOrderLineId,
                executionLineDocument: OrderExecutionLineDocument.SALES_PICK_LINE,
                executionLineId: pl.id,
                activityType: activity,
                notes: 'Seeded execution (session not STARTED/RESUMED)'
              }
            })
          })
          directWrites += 1
          linesTouched += 1
        }
      }
    }

    if (asg.orderType === OrderType.TRANSFER) {
      const pickLines = await prisma.transferOrderPickLine.findMany({
        where: {
          correctionOfLineId: null,
          transferOrderLine: { transferOrderId: asg.orderId }
        },
        orderBy: { createdAt: 'asc' },
        take: LINES_PER_ORDER,
        select: {
          id: true,
          transferOrderLineId: true,
          orderedQuantity: true,
          transferOrderPickId: true
        }
      })

      let slot = 0
      for (const pl of pickLines) {
        const quantity = seededPartialQuantity(pl.orderedQuantity, slot)
        slot += 1
        if (quantity.toNumber() === 0) {
          continue
        }

        if (canUseExecutionMutations(asg.status)) {
          const result = await confirmTransferPickLineHandled(prisma, {
            pickLineId: pl.id,
            quantity,
            disposition: ReceiptOutcome.ACCEPTED,
            orderAssignmentId: asg.id,
            userId: asg.userId,
            warehouseId: asg.warehouseId,
            activityNotes: 'Seeded execution activity'
          })

          if (result.success) {
            mutationCalls += 1
            linesTouched += 1
          } else {
            console.warn(`[seed] confirmTransferPickLineHandled failed: ${result.error}`)
          }
        } else {
          const activity =
            toQty(quantity) >= toQty(pl.orderedQuantity)
              ? ExecutionActivity.LINE_PICKED
              : ExecutionActivity.LINE_PARTIALLY_PICKED

          await prisma.$transaction(async (tx) => {
            await tx.transferOrderPickLine.update({
              where: { id: pl.id },
              data: {
                quantity,
                disposition: ReceiptOutcome.ACCEPTED
              }
            })
            await recomputeTransferOrderPickRollups(tx, pl.transferOrderPickId)
            await tx.orderExecutionActivity.create({
              data: {
                orderAssignmentId: asg.id,
                userId: asg.userId,
                warehouseId: asg.warehouseId,
                zoneId,
                orderId: asg.orderId,
                orderType: OrderType.TRANSFER,
                orderLineRefId: pl.transferOrderLineId,
                executionLineDocument: OrderExecutionLineDocument.TRANSFER_PICK_LINE,
                executionLineId: pl.id,
                activityType: activity,
                notes: 'Seeded execution (session not STARTED/RESUMED)'
              }
            })
          })
          directWrites += 1
          linesTouched += 1
        }
      }
    }
  }

  return { linesTouched, mutationCalls, directWrites }
}
