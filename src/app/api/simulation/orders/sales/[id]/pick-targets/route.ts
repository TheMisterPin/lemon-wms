import { fail, ok } from '@/lib/api/response'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ id: string }> }

export type PickTarget = {
  pickLineId: string
  itemId: string
  itemNameSnapshot: string
  uom: string
  orderedQuantity: string
  binStockItemId: string
  binId: string
}

export async function GET(_req: Request, { params }: RouteParams) {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const { id: salesOrderId } = await params

  const pick = await prisma.salesOrderPick.findFirst({
    where: { salesOrderId, deletedAt: null },
    select: {
      lines: {
        where: { correctionOfLineId: null },
        select: {
          id: true,
          itemId: true,
          itemNameSnapshot: true,
          uom: true,
          orderedQuantity: true,
          stockItems: {
            where: { status: 'RESERVED' },
            select: { id: true, binId: true },
            take: 1
          }
        },
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!pick) {
    return fail('No pick found for this sales order.', 'NOT_FOUND', 404)
  }

  const targets: PickTarget[] = []

  for (const line of pick.lines) {
    const stockItem = line.stockItems[0]
    if (!stockItem) {
      continue
    }

    targets.push({
      pickLineId: line.id,
      itemId: line.itemId,
      itemNameSnapshot: line.itemNameSnapshot,
      uom: line.uom,
      orderedQuantity: line.orderedQuantity.toString(),
      binStockItemId: stockItem.id,
      binId: stockItem.binId
    })
  }

  return ok(targets, 'Pick targets retrieved.')
}
