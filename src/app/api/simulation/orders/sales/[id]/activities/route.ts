import { fail, ok } from '@/lib/api/response'
import prisma from '@/lib/prisma'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const { id } = await params

  const [userActivities, executionActivities] = await Promise.all([
    prisma.userActivityEntry.findMany({
      where: { orderId: id },
      orderBy: { createdAt: 'asc' }
    }),
    prisma.orderExecutionActivity.findMany({
      where: { orderId: id, orderType: 'SALES' },
      orderBy: { createdAt: 'asc' }
    })
  ])

  return ok({ userActivities, executionActivities }, 'Activities retrieved.')
}
