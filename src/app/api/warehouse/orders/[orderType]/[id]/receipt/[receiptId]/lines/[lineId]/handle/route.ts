import { NextRequest } from 'next/server'
import { z } from 'zod'

import { BinOperationType, FiscalInventoryEventType, OrderType, Prisma, ReceiptOutcome, ReceiptStatus } from '@/generated/prisma'
import { withIdempotency } from '@/lib/api/idempotency'
import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { confirmPurchaseReceiptLineHandledInTx } from '@/lib/orders/purchase/receipt/receipt-order-mutations'
import prisma from '@/lib/prisma'
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

  const idempotencyKey = req.headers.get('Idempotency-Key')?.trim()
  if (!idempotencyKey) {
    return fail('Idempotency-Key header is required.', 'IDEMPOTENCY_KEY_REQUIRED', 400)
  }

  return withIdempotency(
    prisma,
    { scope: `receipt-line:handle:${receiptId}:${lineId}`, idempotencyKey, body: parsed.data, userId: payload.userId },
    async () => {
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

        let destBinSku = ''
        if (toBinId && destBin) {
          const catalogItem = await prisma.item.findUnique({
            where: { id: receiptLine.itemId },
            select: { sku: true }
          })
          destBinSku = catalogItem?.sku ?? ''
        }

        // Everything below is one atomic transaction: recording the activity/BOE and
        // actually crediting stock used to be two separate transactions, leaving a
        // window where a crash between them recorded an activity with no matching
        // stock effect.
        const outcome = await prisma.$transaction(async (tx) => {
          // Transition receipt OPEN → IN_PROGRESS on first line handled
          if (receiptLine.receiptLine.status === ReceiptStatus.OPEN) {
            await tx.purchaseOrderReceipt.updateMany({
              where: { id: receiptId, status: ReceiptStatus.OPEN },
              data: {
                status: ReceiptStatus.IN_PROGRESS,
                startedById: payload.userId,
                startedAt: new Date()
              }
            })
          }

          const confirmed = await confirmPurchaseReceiptLineHandledInTx(tx, {
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

          if (confirmed.binOperationEntryId && toBinId && destBin) {
            await upsertAvailableStockItem(tx, {
              warehouseId: warehouseId,
              binId: toBinId,
              itemId: receiptLine.itemId,
              name: receiptLine.itemNameSnapshot,
              sku: destBinSku,
              uom: receiptLine.uom,
              quantity,
              boeId: confirmed.binOperationEntryId
            })
            await updateBinCapacityBy(tx, toBinId, quantity)
            await tx.itemLedgerEntry.create({
              data: {
                warehouseId: warehouseId,
                zoneId: destBin.zoneId,
                warItemId: receiptLine.itemId,
                orderId: id,
                orderType: OrderType.PURCHASE,
                boeId: confirmed.binOperationEntryId,
                eventType: FiscalInventoryEventType.RECEIPT,
                performedByUserId: payload.userId,
                quantityDelta: new Prisma.Decimal(quantity),
                uom: receiptLine.uom
              }
            })
          }

          const updatedReceipt = await tx.purchaseOrderReceipt.findUnique({
            where: { id: receiptId },
            select: { status: true }
          })

          return { confirmed, receiptStatus: updatedReceipt?.status ?? null }
        })

        return ok(
          {
            orderExecutionActivityId: outcome.confirmed.orderExecutionActivityId,
            receiptLineId: lineId,
            receiptStatus: outcome.receiptStatus
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
  )
}
