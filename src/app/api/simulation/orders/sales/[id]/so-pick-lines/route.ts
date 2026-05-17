import { fail, ok } from '@/lib/api/response'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const { id: salesOrderId } = await params

  const salesOrder = await prisma.salesOrder.findFirst({
    where: { id: salesOrderId, deletedAt: null },
    select: {
      lines: {
        orderBy: { id: 'asc' },
        select: {
          id: true,
          itemNameSnapshot: true,
          baseQuantity: true,
          uom: true
        }
      }
    }
  })

  if (!salesOrder) {
    return fail('Sales order not found.', 'NOT_FOUND', 404)
  }

  let pick = await prisma.salesOrderPick.findFirst({
    where: {
      salesOrderId,
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
          salesOrderLineId: true,
          itemNameSnapshot: true,
          orderedQuantity: true,
          quantity: true,
          disposition: true,
          uom: true
        }
      }
    }
  })

  if (!pick) {
    pick = await prisma.salesOrderPick.findFirst({
      where: { salesOrderId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reference: true,
        status: true,
        lines: {
          select: {
            salesOrderLineId: true,
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

  const lineIndex = new Map<string, number>(salesOrder.lines.map((l, idx) => [l.id, idx] as [string, number]))
  const rawPickLines = pick?.lines ?? []
  const pickLinesSorted = [...rawPickLines].sort((a, b) => {
    const ia: number = lineIndex.get(a.salesOrderLineId) ?? 999
    const ib: number = lineIndex.get(b.salesOrderLineId) ?? 999

    return ia - ib
  })

  const salesLines = salesOrder.lines.map((l) => ({
    salesOrderLineId: l.id,
    itemNameSnapshot: l.itemNameSnapshot,
    orderedQuantity: l.baseQuantity.toString(),
    uom: l.uom
  }))

  const pickLines = pickLinesSorted.map((l) => ({
    salesOrderLineId: l.salesOrderLineId,
    itemNameSnapshot: l.itemNameSnapshot,
    orderedQuantity: l.orderedQuantity.toString(),
    quantity: l.quantity.toString(),
    disposition: l.disposition,
    uom: l.uom
  }))

  return ok(
    {
      pickId: pick?.id ?? null,
      pickReference: pick?.reference ?? null,
      pickStatus: pick?.status ?? null,
      salesLines,
      pickLines
    },
    'Lines retrieved.'
  )
}
