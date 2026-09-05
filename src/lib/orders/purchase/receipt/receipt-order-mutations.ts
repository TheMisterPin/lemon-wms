import { Prisma, type PrismaClient } from '@/generated/prisma'
import {
  ExecutionActivity,
  OrderExecutionLineDocument,
  OrderType,
  ReceiptOutcome
} from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import {
  createExecutionActivityInTx,
  loadAssignmentForActivity,
  type OrderAssignmentActivityInput
} from '@/lib/logs/order-execution/order-execution.mutations'
import {
  recordOrderStockActivityInTx,
  type OrderStockActivityBinOperationInput
} from '@/lib/logs/order-execution/record-order-stock-activity'
import { recomputePurchaseOrderReceiptRollups } from '@/lib/orders/shared/execution-document-rollups'

type Tx = Prisma.TransactionClient
type Db = PrismaClient

const receiptLineScopedSelect = {
  id: true,
  purchaseOrderReceiptId: true,
  purchaseOrderLineId: true,
  quantity: true,
  orderedQuantity: true,
  uom: true,
  itemId: true,
  itemNameSnapshot: true,
  correctionOfLineId: true,
  receiptLine: {
    select: {
      id: true,
      deletedAt: true,
      purchaseOrderId: true,
      warehouseId: true
    }
  }
} as const

export type ConfirmPurchaseReceiptLineHandledInput = {
  receiptLineId: string
  quantity: Prisma.Decimal
  disposition: ReceiptOutcome
  notes?: string | null
  orderAssignmentId: string
  userId: string
  warehouseId: string
  orderId: string
  orderLineRefId: string
  activityNotes?: string | null
  stockMove?: {
    binOperation: OrderStockActivityBinOperationInput
    logEntityType?: string
    logEntityId?: string
    logMetadata?: Prisma.InputJsonValue
  }
}

export type ConfirmPurchaseReceiptLineHandledResult =
  | {
      success: true
      orderExecutionActivityId: string
      binOperationEntryId?: string
    }
  | {
      success: false
      error: string
      code?: string
    }

export type ConfirmPurchaseReceiptLineHandledInTxResult = {
  orderExecutionActivityId: string
  binOperationEntryId?: string
}

/**
 * confirmPurchaseReceiptLineHandledInTx.
 * Core of confirmPurchaseReceiptLineHandled, taking an already-open
 * transaction so a caller (e.g. the receipt-line-handle route) can run it
 * alongside other writes — such as the actual stock-quantity mutation — in
 * one atomic transaction instead of two. Throws DomainError directly; no
 * {success,...} envelope.
 * @param tx - Parameter for confirmPurchaseReceiptLineHandledInTx.
 * @param input - Parameter for confirmPurchaseReceiptLineHandledInTx.
 * @returns Result from confirmPurchaseReceiptLineHandledInTx.
 */
export async function confirmPurchaseReceiptLineHandledInTx(
  tx: Tx,
  input: ConfirmPurchaseReceiptLineHandledInput
): Promise<ConfirmPurchaseReceiptLineHandledInTxResult> {
  const line = await tx.purchaseOrderReceiptLine.findUnique({
    where: { id: input.receiptLineId },
    select: receiptLineScopedSelect
  })

  if (!line) {
    throw new DomainError('Receipt line not found.', 'NOT_FOUND', 404)
  }

  if (line.correctionOfLineId) {
    throw new DomainError('Cannot update a correction receipt line in place.', 'INVALID_STATE', 400)
  }

  if (line.receiptLine.deletedAt) {
    throw new DomainError('Receipt has been deleted.', 'INVALID_STATE', 400)
  }

  const assignmentInput: OrderAssignmentActivityInput = {
    orderAssignmentId: input.orderAssignmentId,
    userId: input.userId,
    warehouseId: input.warehouseId,
    orderId: input.orderId,
    orderType: OrderType.PURCHASE,
    orderLineRefId: input.orderLineRefId,
    notes: input.activityNotes ?? null
  }

  let orderExecutionActivityId: string
  let binOperationEntryId: string | undefined

  if (input.stockMove) {
    const recorded = await recordOrderStockActivityInTx(tx, {
      assignmentActivityInput: assignmentInput,
      activityType: ExecutionActivity.LINE_RECEIVED,
      executionLineDocument: OrderExecutionLineDocument.PURCHASE_RECEIPT_LINE,
      executionLineId: line.id,
      notes: input.activityNotes ?? null,
      userActivity:
        typeof input.stockMove.logEntityId === 'string'
          ? {
            entityType: input.stockMove.logEntityType ?? 'PurchaseOrderReceiptLine',
            entityId: input.stockMove.logEntityId,
            metadata: input.stockMove.logMetadata
          }
          : undefined,
      binOperation: input.stockMove.binOperation
    })
    orderExecutionActivityId = recorded.orderExecutionActivityId
    binOperationEntryId = recorded.binOperationEntryId
  } else {
    const assignmentRow = await loadAssignmentForActivity(tx, assignmentInput)
    const activityRow = await createExecutionActivityInTx(
      tx,
      assignmentRow,
      assignmentInput,
      ExecutionActivity.LINE_RECEIVED,
      {
        executionLineDocument: OrderExecutionLineDocument.PURCHASE_RECEIPT_LINE,
        executionLineId: line.id
      }
    )
    orderExecutionActivityId = activityRow.id
  }

  await tx.purchaseOrderReceiptLine.update({
    where: { id: line.id },
    data: {
      quantity: input.quantity,
      disposition: input.disposition,
      notes: input.notes ?? null,
      orderExecutionActivityId
    }
  })

  await recomputePurchaseOrderReceiptRollups(tx, line.purchaseOrderReceiptId)

  return { orderExecutionActivityId, binOperationEntryId }
}

export async function confirmPurchaseReceiptLineHandled(
  db: Db,
  input: ConfirmPurchaseReceiptLineHandledInput
): Promise<ConfirmPurchaseReceiptLineHandledResult> {
  try {
    const outcome = await db.$transaction((tx: Tx) => confirmPurchaseReceiptLineHandledInTx(tx, input))

    return { success: true, ...outcome }
  } catch (err) {
    if (err instanceof DomainError) {
      return { success: false, error: err.message, code: err.code }
    }

    console.error(err)

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error confirming receipt line.'
    }
  }
}

export type ReversePurchaseReceiptLineInput = {
  /** Primary receipt line to correct (not a correction row). */
  receiptLineId: string
  orderAssignmentId: string
  userId: string
  warehouseId: string
  orderId: string
  orderLineRefId: string
  notes?: string | null
  activityNotes?: string | null
  /** When omitted, reverses the full current quantity on the line. */
  correctionQuantity?: Prisma.Decimal
  stockMove?: {
    binOperation: OrderStockActivityBinOperationInput
    logEntityType?: string
    logEntityId?: string
    logMetadata?: Prisma.InputJsonValue
  }
}

export type ReversePurchaseReceiptLineResult =
  | {
      success: true
      correctionLineId: string
      orderExecutionActivityId: string
      binOperationEntryId?: string
    }
  | {
      success: false
      error: string
      code?: string
    }

export async function reversePurchaseReceiptLine(
  db: Db,
  input: ReversePurchaseReceiptLineInput
): Promise<ReversePurchaseReceiptLineResult> {
  try {
    const outcome = await db.$transaction(async (tx: Tx) => {
      const original = await tx.purchaseOrderReceiptLine.findUnique({
        where: { id: input.receiptLineId },
        select: receiptLineScopedSelect
      })

      if (!original) {
        throw new DomainError('Receipt line not found.', 'NOT_FOUND', 404)
      }

      if (original.correctionOfLineId) {
        throw new DomainError('Use the primary receipt line as the reversal target.', 'INVALID_STATE', 400)
      }

      if (original.receiptLine.deletedAt) {
        throw new DomainError('Receipt has been deleted.', 'INVALID_STATE', 400)
      }

      const negatedQty = (input.correctionQuantity ?? original.quantity).mul(-1)

      const correctionLine = await tx.purchaseOrderReceiptLine.create({
        data: {
          purchaseOrderReceiptId: original.purchaseOrderReceiptId,
          purchaseOrderLineId: original.purchaseOrderLineId,
          quantity: negatedQty,
          orderedQuantity: original.orderedQuantity,
          uom: original.uom,
          itemId: original.itemId,
          itemNameSnapshot: original.itemNameSnapshot,
          disposition: ReceiptOutcome.CORRECTION,
          correctionOfLineId: original.id,
          notes: input.notes ?? null
        },
        select: { id: true }
      })

      const assignmentInput: OrderAssignmentActivityInput = {
        orderAssignmentId: input.orderAssignmentId,
        userId: input.userId,
        warehouseId: input.warehouseId,
        orderId: input.orderId,
        orderType: OrderType.PURCHASE,
        orderLineRefId: input.orderLineRefId,
        notes: input.activityNotes ?? null
      }

      let orderExecutionActivityId: string
      let binOperationEntryId: string | undefined

      if (input.stockMove) {
        const recorded = await recordOrderStockActivityInTx(tx, {
          assignmentActivityInput: assignmentInput,
          activityType: ExecutionActivity.LINE_REVERSED,
          executionLineDocument: OrderExecutionLineDocument.PURCHASE_RECEIPT_LINE,
          executionLineId: correctionLine.id,
          notes: input.activityNotes ?? null,
          userActivity:
            typeof input.stockMove.logEntityId === 'string'
              ? {
                entityType: input.stockMove.logEntityType ?? 'PurchaseOrderReceiptLine',
                entityId: input.stockMove.logEntityId,
                metadata: input.stockMove.logMetadata
              }
              : undefined,
          binOperation: input.stockMove.binOperation
        })
        orderExecutionActivityId = recorded.orderExecutionActivityId
        binOperationEntryId = recorded.binOperationEntryId
      } else {
        const assignmentRow = await loadAssignmentForActivity(tx, assignmentInput)
        const activityRow = await createExecutionActivityInTx(
          tx,
          assignmentRow,
          assignmentInput,
          ExecutionActivity.LINE_REVERSED,
          {
            executionLineDocument: OrderExecutionLineDocument.PURCHASE_RECEIPT_LINE,
            executionLineId: correctionLine.id
          }
        )
        orderExecutionActivityId = activityRow.id
      }

      await tx.purchaseOrderReceiptLine.update({
        where: { id: correctionLine.id },
        data: { orderExecutionActivityId }
      })

      await recomputePurchaseOrderReceiptRollups(tx, original.purchaseOrderReceiptId)

      return { correctionLineId: correctionLine.id, orderExecutionActivityId, binOperationEntryId }
    })

    return { success: true, ...outcome }
  } catch (err) {
    if (err instanceof DomainError) {
      return { success: false, error: err.message, code: err.code }
    }

    console.error(err)

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error reversing receipt line.'
    }
  }
}
