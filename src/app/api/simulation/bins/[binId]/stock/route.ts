import { fail, ok } from '@/lib/api/response'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ binId: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const { binId } = await params

  const stock = await prisma.binStockItem.findMany({
    where: { binId },
    orderBy: { createdAt: 'asc' }
  })

  return ok(stock, 'Bin stock retrieved.')
}
