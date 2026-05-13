import {
  AssignmentLifecycle,
  OrderStatus,
  OrderType,
  ReceiptOutcome,
  ReceiptStatus,
  type PrismaClient
} from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { createUserActivityEntry, LOG_ACTION_TYPES } from '@/lib/logs'

export type CompletePurchaseOrderReceiptInput = {
  receiptId: string
  purchaseOrderId: string
  orderAssignmentId: string
  userId: string
  warehouseId: string
  notes?: string | null
}

export type CompletePurchaseOrderReceiptResult =
  | {
      success: true
      orderId: string
      orderStatus: OrderStatus
      receiptId: string
      receiptStatus: ReceiptStatus
      assignmentStatus: AssignmentLifecycle
    }
  | {
      success: false
      error: string
      code?: string
    }

const VALID_RECEIPT_STATUSES: ReceiptStatus[] = [ReceiptStatus.OPEN, ReceiptStatus.IN_PROGRESS]

export async function completePurchaseOrderReceipt(
  prisma: PrismaClient,
  input: CompletePurchaseOrderReceiptInput
): Promise<CompletePurchaseOrderReceiptResult> {
  try {
    const outcome = await prisma.$transaction(async (tx) => {
      const receipt = await tx.purchaseOrderReceipt.findUnique({
        where: { id: input.receiptId },
        select: {
          id: true,
          status: true,
          purchaseOrderId: true,
          warehouseId: true,
          lines: {
            where: { correctionOfLineId: null },
            select: { disposition: true }
          }
        }
      })

      if (!receipt) {
        throw new DomainError('Receipt not found.', 'NOT_FOUND', 404)
      }

      if (receipt.warehouseId !== input.warehouseId) {
        throw new DomainError('Receipt does not belong to your warehouse.', 'FORBIDDEN', 403)
      }

      if (receipt.purchaseOrderId !== input.purchaseOrderId) {
        throw new DomainError('Receipt does not belong to this purchase order.', 'INVALID_STATE', 400)
      }

      if (!VALID_RECEIPT_STATUSES.includes(receipt.status)) {
        throw new DomainError(
          'Receipt cannot be completed in its current state.',
          'INVALID_TRANSITION',
          409
        )
      }

      const po = await tx.purchaseOrder.findUnique({
        where: { id: input.purchaseOrderId },
        select: { status: true, reference: true }
      })

      if (!po) {
        throw new DomainError('Purchase order not found.', 'NOT_FOUND', 404)
      }

      if (po.status !== OrderStatus.EXECUTING) {
        throw new DomainError(
          'Purchase order must be EXECUTING to complete receipt.',
          'INVALID_TRANSITION',
          409
        )
      }

      const assignment = await tx.orderAssignment.findUnique({
        where: { id: input.orderAssignmentId },
        select: { id: true, userId: true, warehouseId: true, status: true, isActive: true }
      })

      if (!assignment) {
        throw new DomainError('Order assignment not found.', 'NOT_FOUND', 404)
      }

      if (assignment.userId !== input.userId) {
        throw new DomainError('Assignment does not belong to this user.', 'FORBIDDEN', 403)
      }

      const hasProblems = receipt.lines.some((l) => l.disposition !== ReceiptOutcome.ACCEPTED)
      const newReceiptStatus = hasProblems
        ? ReceiptStatus.COMPLETED_WITH_PROBLEMS
        : ReceiptStatus.COMPLETED
      const newOrderStatus = hasProblems
        ? OrderStatus.EXECUTED_WITH_PROBLEMS
        : OrderStatus.EXECUTED

      const now = new Date()

      await tx.purchaseOrderReceipt.update({
        where: { id: input.receiptId },
        data: {
          status: newReceiptStatus,
          completedById: input.userId,
          completedAt: now
        }
      })

      await tx.purchaseOrder.update({
        where: { id: input.purchaseOrderId },
        data: {
          status: newOrderStatus,
          executionCompletedAt: now
        }
      })

      const updatedAssignment = await tx.orderAssignment.update({
        where: { id: input.orderAssignmentId },
        data: {
          status: AssignmentLifecycle.COMPLETED,
          completedAt: now,
          isActive: false
        }
      })

      await createUserActivityEntry({
        prisma: tx,
        userId: input.userId,
        actionType: LOG_ACTION_TYPES.ORDER_EXECUTED,
        entityType: 'ORDER',
        entityId: input.purchaseOrderId,
        warehouseId: input.warehouseId,
        orderId: input.purchaseOrderId,
        orderType: OrderType.PURCHASE,
        orderAssignmentId: input.orderAssignmentId,
        notes: input.notes ?? undefined,
        metadata: {
          orderType: 'PURCHASE',
          reference: po.reference,
          receiptId: input.receiptId,
          receiptStatus: newReceiptStatus,
          orderStatus: newOrderStatus
        }
      })

      return {
        orderId: input.purchaseOrderId,
        orderStatus: newOrderStatus,
        receiptId: input.receiptId,
        receiptStatus: newReceiptStatus,
        assignmentStatus: updatedAssignment.status
      }
    })

    return { success: true, ...outcome }
  } catch (err) {
    if (err instanceof DomainError) {
      return { success: false, error: err.message, code: err.code }
    }

    console.error(err)

    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unexpected error completing receipt.'
    }
  }
}
