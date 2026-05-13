import { fail, ok } from '@/lib/api/response'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const { id: purchaseOrderId } = await params

  const purchaseOrder = await prisma.purchaseOrder.findFirst({
    where: { id: purchaseOrderId, deletedAt: null },
    select: {
      lines: {
        orderBy: { lineSequence: 'asc' },
        select: {
          id: true,
          lineSequence: true,
          itemNameSnapshot: true,
          orderedQuantity: true,
          uom: true
        }
      }
    }
  })

  if (!purchaseOrder) {
    return fail('Purchase order not found.', 'NOT_FOUND', 404)
  }

  let receipt = await prisma.purchaseOrderReceipt.findFirst({
    where: {
      purchaseOrderId,
      deletedAt: null,
      status: { in: ['OPEN', 'IN_PROGRESS'] }
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      reference: true,
      status: true,
      lines: {
        select: {
          purchaseOrderLineId: true,
          itemNameSnapshot: true,
          orderedQuantity: true,
          quantity: true,
          disposition: true,
          uom: true
        }
      }
    }
  })

  if (!receipt) {
    receipt = await prisma.purchaseOrderReceipt.findFirst({
      where: { purchaseOrderId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        lines: {
          select: {
            purchaseOrderLineId: true,
            itemNameSnapshot: true,
            orderedQuantity: true,
            quantity: true,
            disposition: true,
            uom: true
          }
        }
      }
    })
  }

  const sequenceIndex = new Map(
    purchaseOrder.lines.map((l, idx) => [l.id, idx])
  )

  const rawReceiptLines = receipt?.lines ?? []
  const receiptLinesSorted = [...rawReceiptLines].sort((a, b) => {
    const ia = sequenceIndex.get(a.purchaseOrderLineId) ?? 999
    const ib = sequenceIndex.get(b.purchaseOrderLineId) ?? 999

    return ia - ib
  })

  const purchaseLines = purchaseOrder.lines.map((l) => ({
    lineSequence: l.lineSequence,
    itemNameSnapshot: l.itemNameSnapshot,
    orderedQuantity: l.orderedQuantity.toString(),
    uom: l.uom
  }))

  const receiptLines = receiptLinesSorted.map((l) => ({
    purchaseOrderLineId: l.purchaseOrderLineId,
    itemNameSnapshot: l.itemNameSnapshot,
    orderedQuantity: l.orderedQuantity.toString(),
    quantity: l.quantity.toString(),
    disposition: l.disposition,
    uom: l.uom
  }))

  return ok(
    {
      receiptId: receipt?.id ?? null,
      receiptReference: receipt?.reference ?? null,
      receiptStatus: receipt?.status ?? null,
      purchaseLines,
      receiptLines
    },
    'Lines retrieved.'
  )
}
