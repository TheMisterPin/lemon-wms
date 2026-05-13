import { fail, ok } from '@/lib/api/response'
import prisma from '@/lib/prisma'

export async function GET() {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const orders = await prisma.purchaseOrder.findMany({
    where: { status: 'RELEASED', deletedAt: null },
    select: {
      id: true,
      reference: true,
      warehouseId: true,
      supplierNameSnapshot: true,
      _count: {
        select: { lines: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const payload = orders.map((o) => ({
    id: o.id,
    reference: o.reference,
    warehouseId: o.warehouseId,
    supplierNameSnapshot: o.supplierNameSnapshot,
    totalLines: o._count.lines
  }))

  return ok(payload, 'Released orders retrieved.')
}
