import { fail, ok } from '@/lib/api/response'
import prisma from '@/lib/prisma'

export async function GET() {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const orders = await prisma.salesOrder.findMany({
    where: { status: 'RELEASED', deletedAt: null },
    select: {
      id: true,
      reference: true,
      warehouseId: true,
      customerName: true,
      _count: { select: { picks: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const payload = orders.map((o) => ({
    id: o.id,
    reference: o.reference,
    warehouseId: o.warehouseId,
    customerName: o.customerName,
    hasPick: o._count.picks > 0
  }))

  return ok(payload, 'Released sales orders retrieved.')
}
