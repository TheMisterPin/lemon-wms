import { fail, ok } from '@/lib/api/response'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const { id } = await params

  const entries = await prisma.binOperationEntry.findMany({
    where: { orderId: id, orderType: 'PURCHASE' },
    orderBy: { createdAt: 'asc' }
  })

  return ok(entries, 'Bin operations retrieved.')
}
