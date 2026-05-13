import { ok, fail } from '@/lib/api/response'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'
import { runDemoAddProgressForExecutingPurchaseOrders } from '@/lib/simulation/demo-add-progress'

export async function POST() {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  try {
    const results = await runDemoAddProgressForExecutingPurchaseOrders(prisma)

    return ok(results, 'Add progress batch finished.')
  } catch (error) {
    logAppError('[POST /api/simulation/add-progress]', error)

    return fail('Failed to run add-progress batch.')
  }
}
