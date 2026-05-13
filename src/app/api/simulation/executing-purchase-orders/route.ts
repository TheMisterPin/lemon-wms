import { ok, fail } from '@/lib/api/response'
import prisma from '@/lib/prisma'
import { loadDemoFloorWorkers, listExecutingPurchaseOrdersForDemo } from '@/lib/simulation/demo-add-progress'

export async function GET() {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const [orders, workers] = await Promise.all([
    listExecutingPurchaseOrdersForDemo(prisma),
    loadDemoFloorWorkers(prisma)
  ])

  return ok(
    {
      orders,
      workersAvailable: workers.length > 0
    },
    'Executing purchase orders retrieved.'
  )
}
