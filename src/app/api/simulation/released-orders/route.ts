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
      totalLines: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return ok(orders, 'Released orders retrieved.')
}
