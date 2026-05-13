import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { confirmPurchaseReceiptLineHandled } from '@/lib/orders/purchase/receipt/receipt-order-mutations'
import prisma from '@/lib/prisma'
import { BinOperationType, FiscalInventoryEventType, OrderType, Prisma, ReceiptOutcome, ReceiptStatus } from '@/generated/prisma'
import { updateBinCapacityBy, upsertAvailableStockItem } from '@/lib/stock/stock-mutations'

const handleLineSchema = z.object({
  quantity: z.number().positive(),
  disposition: z.nativeEnum(ReceiptOutcome),
  notes: z.string().optional().nullable(),
  orderAssignmentId: z.string().min(1),
  activityNotes: z.string().optional().nullable(),
  toBinId: z.string().optional().nullable()
})

type RouteParams = {
  params: Promise<{ orderType: string; id: string; receiptId: string; lineId: string }>
}

/**
 * @swagger
 * /api/warehouse/orders/{orderType}/{id}/receipt/{receiptId}/lines/{lineId}/handle:
 *   post:
 *     summary: Declare quantity received on a purchase order receipt line
 *     tags: [Warehouse]
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isFloorRole(payload.role)) {
    return forbidden('Only warehouse users can handle receipt lines.')
  }

  const { orderType, id: rawId, receiptId, lineId } = await params

  if (orderType !== 'purchase') {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  const id = rawId?.trim()
  if (!id || !receiptId || !lineId) {
    return fail('Order id, receipt id, and line id are required.', 'VALIDATION_ERROR', 400)
  }

  if (!payload.warehouseId) {
    return fail('Warehouse context is required.', 'VALIDATION_ERROR', 400)
  }
  const warehouseId = payload.warehouseId

  const body = await req.json().catch(() => null)
  const parsed = handleLineSchema.safeParse(body)
  if (!parsed.success) {
    return fail('Validation failed.', 'VALIDATION_ERROR', 400)
  }

  const { quantity, disposition, notes, orderAssignmentId, activityNotes, toBinId } = parsed.data

  try {
    const receiptLine = await prisma.purchaseOrderReceiptLine.findUnique({
      where: { id: lineId },
      select: {
        purchaseOrderLineId: true,
        itemId: true,
        uom: true,
        itemNameSnapshot: true,
        receiptLine: { select: { id: true, warehouseId: true, purchaseOrderId: true, status: true } }
      }
    })

    if (!receiptLine) {
      return fail('Receipt line not found.', 'NOT_FOUND', 404)
    }

    if (receiptLine.receiptLine.purchaseOrderId !== id) {
      return fail('Receipt line does not belong to this purchase order.', 'INVALID_STATE', 400)
    }

    if (receiptLine.receiptLine.warehouseId !== warehouseId) {
      return fail('Receipt does not belong to your warehouse.', 'FORBIDDEN', 403)
    }

    if (receiptLine.receiptLine.status === ReceiptStatus.COMPLETED ||
        receiptLine.receiptLine.status === ReceiptStatus.COMPLETED_WITH_PROBLEMS) {
      return fail('Receipt is already completed.', 'INVALID_STATE', 409)
    }

    // Transition receipt OPEN → IN_PROGRESS on first line handled
    if (receiptLine.receiptLine.status === ReceiptStatus.OPEN) {
      await prisma.purchaseOrderReceipt.updateMany({
        where: { id: receiptId, status: ReceiptStatus.OPEN },
        data: {
          status: ReceiptStatus.IN_PROGRESS,
          startedById: payload.userId,
          startedAt: new Date()
        }
      })
    }

    let destBin: { zoneId: string } | null = null
    if (toBinId) {
      destBin = await prisma.bin.findUnique({
        where: { id: toBinId },
        select: { zoneId: true }
      })
      if (!destBin) {
        return fail('Destination bin not found.', 'NOT_FOUND', 404)
      }
    }

    const result = await confirmPurchaseReceiptLineHandled(prisma, {
      receiptLineId: lineId,
      quantity: new Prisma.Decimal(quantity),
      disposition,
      notes: notes ?? null,
      orderAssignmentId,
      userId: payload.userId,
      warehouseId: warehouseId,
      orderId: id,
      orderLineRefId: receiptLine.purchaseOrderLineId,
      activityNotes: activityNotes ?? null,
      ...(toBinId && destBin && {
        stockMove: {
          binOperation: {
            userId: payload.userId,
            warehouseId: warehouseId,
            zoneId: destBin.zoneId,
            type: BinOperationType.RECEIVE,
            toBinId,
            warItemId: receiptLine.itemId,
            quantity: new Prisma.Decimal(quantity),
            uom: receiptLine.uom,
            orderId: id,
            orderType: OrderType.PURCHASE,
            affectsFiscalStock: true
          }
        }
      })
    })

    if (!result.success) {
      return fail(result.error, result.code ?? 'DOMAIN_ERROR', 409)
    }

    if (result.binOperationEntryId && toBinId && destBin) {
      const catalogItem = await prisma.item.findUnique({
        where: { id: receiptLine.itemId },
        select: { sku: true }
      })
      const sku = catalogItem?.sku ?? ''

      await prisma.$transaction(async (tx) => {
        await upsertAvailableStockItem(tx, {
          warehouseId: warehouseId,
          binId: toBinId,
          itemId: receiptLine.itemId,
          name: receiptLine.itemNameSnapshot,
          sku,
          uom: receiptLine.uom,
          quantity,
          boeId: result.binOperationEntryId!
        })
        await updateBinCapacityBy(tx, toBinId, quantity)
        await tx.itemLedgerEntry.create({
          data: {
            warehouseId: warehouseId,
            zoneId: destBin!.zoneId,
            warItemId: receiptLine.itemId,
            orderId: id,
            orderType: OrderType.PURCHASE,
            boeId: result.binOperationEntryId!,
            eventType: FiscalInventoryEventType.RECEIPT,
            performedByUserId: payload.userId,
            quantityDelta: new Prisma.Decimal(quantity),
            uom: receiptLine.uom
          }
        })
      })
    }

    const updatedReceipt = await prisma.purchaseOrderReceipt.findUnique({
      where: { id: receiptId },
      select: { status: true }
    })

    return ok(
      {
        orderExecutionActivityId: result.orderExecutionActivityId,
        receiptLineId: lineId,
        receiptStatus: updatedReceipt?.status ?? null
      },
      'Receipt line handled.'
    )
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    logAppError('[POST /api/warehouse/orders/[orderType]/[id]/receipt/[receiptId]/lines/[lineId]/handle]', error)

    return fail('Failed to handle receipt line.')
  }
}
