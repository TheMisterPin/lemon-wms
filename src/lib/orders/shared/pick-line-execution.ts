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
import {
  recomputeAdjustmentOrderPickRollups,
  recomputeReturnOrderPickRollups,
  recomputeSalesOrderPickRollups,
  recomputeTransferOrderPickRollups
} from '@/lib/orders/shared/execution-document-rollups'
import { toQty } from '@/lib/orders/shared/pick-line-progress'

type Tx = Prisma.TransactionClient
type Db = PrismaClient

type PickKind = 'SALES' | 'TRANSFER' | 'RETURN' | 'ADJUSTMENT'

type PickLineCore = {
  id: string
  salesOrderPickId?: string | null
  transferOrderPickId?: string | null
  returnOrderPickId?: string | null
  adjustmentOrderPickId?: string | null
  salesOrderLineId?: string | null
  transferOrderLineId?: string | null
  returnOrderLineId?: string | null
  adjustmentOrderId?: string | null
  sequence?: number | null
  orderedQuantity: Prisma.Decimal
  quantity: Prisma.Decimal
  uom: string
  itemId: string
  itemNameSnapshot: string
  correctionOfLineId: string | null
  pick: {
    id: string
    deletedAt: Date | null
    salesOrderId?: string | null
    transferOrderId?: string | null
    returnOrderId?: string | null
    adjustmentOrderId?: string | null
    warehouseId: string
  }
}

function pickActivityForQuantities(quantity: Prisma.Decimal, orderedQuantity: Prisma.Decimal): ExecutionActivity {
  return toQty(quantity) >= toQty(orderedQuantity)
    ? ExecutionActivity.LINE_PICKED
    : ExecutionActivity.LINE_PARTIALLY_PICKED
}

function orderTypeForPickKind(kind: PickKind): OrderType {
  switch (kind) {
  case 'SALES':
    return OrderType.SALES
  case 'TRANSFER':
    return OrderType.TRANSFER
  case 'RETURN':
    return OrderType.RETURN
  case 'ADJUSTMENT':
    return OrderType.ADJUSTMENT
  }
}

function documentForPickKind(kind: PickKind): OrderExecutionLineDocument {
  switch (kind) {
  case 'SALES':
    return OrderExecutionLineDocument.SALES_PICK_LINE
  case 'TRANSFER':
    return OrderExecutionLineDocument.TRANSFER_PICK_LINE
  case 'RETURN':
    return OrderExecutionLineDocument.RETURN_PICK_LINE
  case 'ADJUSTMENT':
    return OrderExecutionLineDocument.ADJUSTMENT_PICK_LINE
  }
}

async function loadPickLine(tx: Tx, kind: PickKind, pickLineId: string): Promise<PickLineCore | null> {
  switch (kind) {
  case 'SALES':
    return tx.salesOrderPickLine.findUnique({
      where: { id: pickLineId },
      select: {
        id: true,
        salesOrderPickId: true,
        salesOrderLineId: true,
        orderedQuantity: true,
        quantity: true,
        uom: true,
        itemId: true,
        itemNameSnapshot: true,
        correctionOfLineId: true,
        pick: {
          select: {
            id: true,
            deletedAt: true,
            warehouseId: true,
            salesOrderId: true
          }
        }
      }
    })
  case 'TRANSFER':
    return tx.transferOrderPickLine.findUnique({
      where: { id: pickLineId },
      select: {
        id: true,
        transferOrderPickId: true,
        transferOrderLineId: true,
        orderedQuantity: true,
        quantity: true,
        uom: true,
        itemId: true,
        itemNameSnapshot: true,
        correctionOfLineId: true,
        pick: {
          select: {
            id: true,
            deletedAt: true,
            warehouseId: true,
            transferOrderId: true
          }
        }
      }
    })
  case 'RETURN':
    return tx.returnOrderPickLine.findUnique({
      where: { id: pickLineId },
      select: {
        id: true,
        returnOrderPickId: true,
        returnOrderLineId: true,
        orderedQuantity: true,
        quantity: true,
        uom: true,
        itemId: true,
        itemNameSnapshot: true,
        correctionOfLineId: true,
        pick: {
          select: {
            id: true,
            deletedAt: true,
            warehouseId: true,
            returnOrderId: true
          }
        }
      }
    })
  case 'ADJUSTMENT':
    return tx.adjustmentOrderPickLine.findUnique({
      where: { id: pickLineId },
      select: {
        id: true,
        adjustmentOrderPickId: true,
        adjustmentOrderId: true,
        sequence: true,
        orderedQuantity: true,
        quantity: true,
        uom: true,
        itemId: true,
        itemNameSnapshot: true,
        correctionOfLineId: true,
        pick: {
          select: {
            id: true,
            deletedAt: true,
            warehouseId: true,
            adjustmentOrderId: true
          }
        }
      }
    })
  }
}

function pickHeaderId(line: PickLineCore): string {
  if (line.salesOrderPickId) {
    return line.salesOrderPickId
  }
  if (line.transferOrderPickId) {
    return line.transferOrderPickId
  }
  if (line.returnOrderPickId) {
    return line.returnOrderPickId
  }
  if (line.adjustmentOrderPickId) {
    return line.adjustmentOrderPickId
  }

  throw new DomainError('Pick line is missing header id.', 'INVALID_STATE', 400)
}

function orderIdFromPick(line: PickLineCore, kind: PickKind): string {
  const p = line.pick
  switch (kind) {
  case 'SALES':
    if (!p.salesOrderId) {
      break
    }

    return p.salesOrderId
  case 'TRANSFER':
    if (!p.transferOrderId) {
      break
    }

    return p.transferOrderId
  case 'RETURN':
    if (!p.returnOrderId) {
      break
    }

    return p.returnOrderId
  case 'ADJUSTMENT':
    if (!p.adjustmentOrderId) {
      break
    }

    return p.adjustmentOrderId
  }

  throw new DomainError('Pick document is missing order id.', 'INVALID_STATE', 400)
}

function masterLineRefFromPickLine(line: PickLineCore, kind: PickKind): string {
  switch (kind) {
  case 'SALES':
    if (!line.salesOrderLineId) {
      break
    }

    return line.salesOrderLineId
  case 'TRANSFER':
    if (!line.transferOrderLineId) {
      break
    }

    return line.transferOrderLineId
  case 'RETURN':
    if (!line.returnOrderLineId) {
      break
    }

    return line.returnOrderLineId
  case 'ADJUSTMENT':
    if (
      line.adjustmentOrderId === null
      || line.adjustmentOrderId === undefined
      || line.sequence === null
      || line.sequence === undefined
    ) {
      break
    }

    return `${line.adjustmentOrderId}:${line.sequence}`
  }

  throw new DomainError('Pick line is missing master line reference.', 'INVALID_STATE', 400)
}

async function recomputePickForKind(tx: Tx, kind: PickKind, pickHeaderId: string): Promise<void> {
  switch (kind) {
  case 'SALES':
    await recomputeSalesOrderPickRollups(tx, pickHeaderId)

    return
  case 'TRANSFER':
    await recomputeTransferOrderPickRollups(tx, pickHeaderId)

    return
  case 'RETURN':
    await recomputeReturnOrderPickRollups(tx, pickHeaderId)

    return
  case 'ADJUSTMENT':
    await recomputeAdjustmentOrderPickRollups(tx, pickHeaderId)

    return
  }
}

export type ConfirmPickLineHandledSharedInput = {
  pickLineId: string
  quantity: Prisma.Decimal
  disposition: ReceiptOutcome
  notes?: string | null
  orderAssignmentId: string
  userId: string
  warehouseId: string
  activityNotes?: string | null
  stockMove?: {
    binOperation: OrderStockActivityBinOperationInput
    logEntityType?: string
    logEntityId?: string
    logMetadata?: Prisma.InputJsonValue
  }
}

export type ConfirmPickLineHandledResult =
  | {
      success: true
      orderExecutionActivityId: string
      binOperationEntryId?: string
    }
  | { success: false; error: string; code?: string }

export type ConfirmPickLineHandledSharedInTxResult = {
  orderExecutionActivityId: string
  binOperationEntryId?: string
}

/**
 * confirmPickLineHandledSharedInTx.
 * Core of confirmPickLineHandledShared, taking an already-open transaction so
 * a caller can run it alongside other writes in one atomic transaction.
 * Throws DomainError directly; no {success,...} envelope.
 * @param tx - Parameter for confirmPickLineHandledSharedInTx.
 * @param kind - Parameter for confirmPickLineHandledSharedInTx.
 * @param input - Parameter for confirmPickLineHandledSharedInTx.
 * @returns Result from confirmPickLineHandledSharedInTx.
 */
export async function confirmPickLineHandledSharedInTx(
  tx: Tx,
  kind: PickKind,
  input: ConfirmPickLineHandledSharedInput
): Promise<ConfirmPickLineHandledSharedInTxResult> {
  const line = await loadPickLine(tx, kind, input.pickLineId)

  if (!line) {
    throw new DomainError('Pick line not found.', 'NOT_FOUND', 404)
  }

  if (line.correctionOfLineId) {
    throw new DomainError('Cannot update a correction pick line in place.', 'INVALID_STATE', 400)
  }

  if (line.pick.deletedAt) {
    throw new DomainError('Pick document has been deleted.', 'INVALID_STATE', 400)
  }

  const orderId = orderIdFromPick(line, kind)
  const orderLineRefId = masterLineRefFromPickLine(line, kind)
  const document = documentForPickKind(kind)
  const activityType = pickActivityForQuantities(input.quantity, line.orderedQuantity)
  const headerId = pickHeaderId(line)

  const assignmentInput: OrderAssignmentActivityInput = {
    orderAssignmentId: input.orderAssignmentId,
    userId: input.userId,
    warehouseId: input.warehouseId,
    orderId,
    orderType: orderTypeForPickKind(kind),
    orderLineRefId,
    notes: input.activityNotes ?? null
  }

  let orderExecutionActivityId: string
  let binOperationEntryId: string | undefined

  if (input.stockMove) {
    const recorded = await recordOrderStockActivityInTx(tx, {
      assignmentActivityInput: assignmentInput,
      activityType,
      executionLineDocument: document,
      executionLineId: line.id,
      notes: input.activityNotes ?? null,
      userActivity:
        typeof input.stockMove.logEntityId === 'string'
          ? {
            entityType: input.stockMove.logEntityType ?? 'PickLine',
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
      activityType,
      { executionLineDocument: document, executionLineId: line.id }
    )
    orderExecutionActivityId = activityRow.id
  }

  const updateData = {
    quantity: input.quantity,
    disposition: input.disposition,
    notes: input.notes ?? null,
    orderExecutionActivityId
  }

  switch (kind) {
  case 'SALES':
    await tx.salesOrderPickLine.update({ where: { id: line.id }, data: updateData })
    break
  case 'TRANSFER':
    await tx.transferOrderPickLine.update({ where: { id: line.id }, data: updateData })
    break
  case 'RETURN':
    await tx.returnOrderPickLine.update({ where: { id: line.id }, data: updateData })
    break
  case 'ADJUSTMENT':
    await tx.adjustmentOrderPickLine.update({ where: { id: line.id }, data: updateData })
    break
  }

  await recomputePickForKind(tx, kind, headerId)

  return { orderExecutionActivityId, binOperationEntryId }
}

export async function confirmPickLineHandledShared(
  db: Db,
  kind: PickKind,
  input: ConfirmPickLineHandledSharedInput
): Promise<ConfirmPickLineHandledResult> {
  try {
    const outcome = await db.$transaction((tx: Tx) => confirmPickLineHandledSharedInTx(tx, kind, input))

    return { success: true, ...outcome }
  } catch (err) {
    if (err instanceof DomainError) {
      return { success: false, error: err.message, code: err.code }
    }

    console.error(err)

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error confirming pick line.'
    }
  }
}

export type ReversePickLineSharedInput = {
  pickLineId: string
  orderAssignmentId: string
  userId: string
  warehouseId: string
  notes?: string | null
  activityNotes?: string | null
  correctionQuantity?: Prisma.Decimal
  stockMove?: {
    binOperation: OrderStockActivityBinOperationInput
    logEntityType?: string
    logEntityId?: string
    logMetadata?: Prisma.InputJsonValue
  }
}

export type ReversePickLineSharedResult =
  | {
      success: true
      correctionLineId: string
      orderExecutionActivityId: string
      binOperationEntryId?: string
    }
  | { success: false; error: string; code?: string }

export async function reversePickLineShared(
  db: Db,
  kind: PickKind,
  input: ReversePickLineSharedInput
): Promise<ReversePickLineSharedResult> {
  try {
    const outcome = await db.$transaction(async (tx: Tx) => {
      const original = await loadPickLine(tx, kind, input.pickLineId)

      if (!original) {
        throw new DomainError('Pick line not found.', 'NOT_FOUND', 404)
      }

      if (original.correctionOfLineId) {
        throw new DomainError('Use the primary pick line as the reversal target.', 'INVALID_STATE', 400)
      }

      if (original.pick.deletedAt) {
        throw new DomainError('Pick document has been deleted.', 'INVALID_STATE', 400)
      }

      const negatedQty = (input.correctionQuantity ?? original.quantity).mul(-1)
      const orderId = orderIdFromPick(original, kind)
      const orderLineRefId = masterLineRefFromPickLine(original, kind)
      const document = documentForPickKind(kind)
      const headerId = pickHeaderId(original)

      const baseLine = {
        quantity: negatedQty,
        orderedQuantity: original.orderedQuantity,
        uom: original.uom,
        itemId: original.itemId,
        itemNameSnapshot: original.itemNameSnapshot,
        disposition: ReceiptOutcome.CORRECTION,
        correctionOfLineId: original.id,
        notes: input.notes ?? null
      }

      let correctionId: string

      switch (kind) {
      case 'SALES': {
        const row = await tx.salesOrderPickLine.create({
          data: {
            ...baseLine,
            salesOrderPickId: original.salesOrderPickId!,
            salesOrderLineId: original.salesOrderLineId!
          },
          select: { id: true }
        })
        correctionId = row.id
        break
      }
      case 'TRANSFER': {
        const row = await tx.transferOrderPickLine.create({
          data: {
            ...baseLine,
            transferOrderPickId: original.transferOrderPickId!,
            transferOrderLineId: original.transferOrderLineId!
          },
          select: { id: true }
        })
        correctionId = row.id
        break
      }
      case 'RETURN': {
        const row = await tx.returnOrderPickLine.create({
          data: {
            ...baseLine,
            returnOrderPickId: original.returnOrderPickId!,
            returnOrderLineId: original.returnOrderLineId!
          },
          select: { id: true }
        })
        correctionId = row.id
        break
      }
      case 'ADJUSTMENT': {
        const row = await tx.adjustmentOrderPickLine.create({
          data: {
            ...baseLine,
            adjustmentOrderPickId: original.adjustmentOrderPickId!,
            adjustmentOrderId: original.adjustmentOrderId!,
            sequence: original.sequence!
          },
          select: { id: true }
        })
        correctionId = row.id
        break
      }
      }

      const assignmentInput: OrderAssignmentActivityInput = {
        orderAssignmentId: input.orderAssignmentId,
        userId: input.userId,
        warehouseId: input.warehouseId,
        orderId,
        orderType: orderTypeForPickKind(kind),
        orderLineRefId,
        notes: input.activityNotes ?? null
      }

      let orderExecutionActivityId: string
      let binOperationEntryId: string | undefined

      if (input.stockMove) {
        const recorded = await recordOrderStockActivityInTx(tx, {
          assignmentActivityInput: assignmentInput,
          activityType: ExecutionActivity.LINE_REVERSED,
          executionLineDocument: document,
          executionLineId: correctionId,
          notes: input.activityNotes ?? null,
          userActivity:
            typeof input.stockMove.logEntityId === 'string'
              ? {
                entityType: input.stockMove.logEntityType ?? 'PickLine',
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
          { executionLineDocument: document, executionLineId: correctionId }
        )
        orderExecutionActivityId = activityRow.id
      }

      switch (kind) {
      case 'SALES':
        await tx.salesOrderPickLine.update({
          where: { id: correctionId },
          data: { orderExecutionActivityId }
        })
        break
      case 'TRANSFER':
        await tx.transferOrderPickLine.update({
          where: { id: correctionId },
          data: { orderExecutionActivityId }
        })
        break
      case 'RETURN':
        await tx.returnOrderPickLine.update({
          where: { id: correctionId },
          data: { orderExecutionActivityId }
        })
        break
      case 'ADJUSTMENT':
        await tx.adjustmentOrderPickLine.update({
          where: { id: correctionId },
          data: { orderExecutionActivityId }
        })
        break
      }

      await recomputePickForKind(tx, kind, headerId)

      return { correctionLineId: correctionId, orderExecutionActivityId, binOperationEntryId }
    })

    return { success: true, ...outcome }
  } catch (err) {
    if (err instanceof DomainError) {
      return { success: false, error: err.message, code: err.code }
    }

    console.error(err)

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error reversing pick line.'
    }
  }
}
