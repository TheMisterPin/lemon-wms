import { Prisma, type PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'

export type PurchaseReceiptOrderCreatedSummary = {
  id: string
  reference: string
  status: string
  lineCount: number
  lines: Array<{ id: string }>
}

export type CreatePurchaseOrderReceiptSuccess = {
  success: true
  receiptOrder: PurchaseReceiptOrderCreatedSummary
}

export type CreatePurchaseOrderReceiptFailure = {
  success: false
  message: string
  code?: string
}

export type CreatePurchaseOrderReceiptResult =
  | CreatePurchaseOrderReceiptSuccess
  | CreatePurchaseOrderReceiptFailure

type OrdersDb = PrismaClient | Prisma.TransactionClient

async function getPurchaseOrder(tx: OrdersDb, purchaseOrderId: string) {
  const purchaseOrder = await tx.purchaseOrder.findFirst({
    where: {
      id: purchaseOrderId,
      deletedAt: null
    },
    select: {
      id: true,
      reference: true,
      warehouseId: true,
      supplierNameSnapshot: true,
      createdById: true,
      notes: true,
      lines: {
        select: {
          id: true,
          lineSequence: true,
          itemId: true,
          itemNameSnapshot: true,
          uom: true,
          orderedQuantity: true,
          notes: true
        }
      }
    }
  })

  if (!purchaseOrder) {
    throw new DomainError('Purchase order not found.', 'NOT_FOUND', 404)
  }

  if (purchaseOrder.lines.length === 0) {
    throw new DomainError(
      'Purchase order has no lines to receive.',
      'INVALID_STATE',
      400
    )
  }

  const mappedOrder = {
    id: purchaseOrder.id,
    reference: purchaseOrder.reference,
    warehouseId: purchaseOrder.warehouseId,
    supplierNameSnapshot: purchaseOrder.supplierNameSnapshot,
    notes: purchaseOrder.notes,
    createdById: purchaseOrder.createdById,
    lines: purchaseOrder.lines.map(line => ({
      id: line.id,
      orderedQuantity: line.orderedQuantity.toNumber(),
      uom: line.uom,
      notes: line.notes,
      itemId: line.itemId,
      itemNameSnapshot: line.itemNameSnapshot
    }))
  }

  return mappedOrder
}

/**
 * Creates a purchase order receipt and one receipt line per PO line in a single transaction.
 * Domain failures throw inside the transaction callback (triggering rollback), then are turned into `{ success: false, ... }`.
 */
async function createPurchaseOrderReceipt(
  prisma: PrismaClient,
  purchaseOrderId: string
): Promise<CreatePurchaseOrderReceiptResult> {
  try {
    const newRecieptOrder = await prisma.$transaction(async tx => {
      const purchaseOrder = await getPurchaseOrder(tx, purchaseOrderId)
      const newReference = `${purchaseOrder.reference}/0001`

      const lineCreates = purchaseOrder.lines.map(line => ({
        purchaseOrderLineId: line.id,
        quantity: 0,
        orderedQuantity: new Prisma.Decimal(line.orderedQuantity),
        uom: line.uom,
        notes: line.notes,
        itemId: line.itemId,
        itemNameSnapshot: line.itemNameSnapshot
      }))

      const created = await tx.purchaseOrderReceipt.create({
        data: {
          reference: newReference,
          purchaseOrderId,
          warehouseId: purchaseOrder.warehouseId,
          supplierNameSnapshot: purchaseOrder.supplierNameSnapshot,
          notes: purchaseOrder.notes,
          createdById: purchaseOrder.createdById,
          lines: {
            create: lineCreates
          }
        },
        select: {
          id: true,
          reference: true,
          status: true,
          lines: { select: { id: true } }
        }
      })

      const summary: PurchaseReceiptOrderCreatedSummary = {
        id: created.id,
        reference: created.reference,
        status: created.status,
        lineCount: created.lines.length,
        lines: created.lines.map(l => ({ id: l.id }))
      }

      return summary
    })

    return {
      success: true,
      receiptOrder: newRecieptOrder
    }
  } catch (err) {
    if (err instanceof DomainError) {
      return {
        success: false,
        message: err.message,
        code: err.code
      }
    }

    console.error(err)

    return {
      success: false,
      message:
        err instanceof Error
          ? err.message
          : 'Unexpected error creating purchase order receipt.'
    }
  }
}

export { createPurchaseOrderReceipt }
