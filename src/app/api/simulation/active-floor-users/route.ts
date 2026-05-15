import { fail, ok } from '@/lib/api/response'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'
import { simulateActiveFloorUsers } from '@/lib/simulation/simulate-active-floor-users'

export async function POST() {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  try {
    const results = await simulateActiveFloorUsers(prisma)

    return ok(results, 'Simulate active floor users finished.')
  } catch (error) {
    logAppError('[POST /api/simulation/active-floor-users]', error)

    return fail('Failed to simulate active floor users.')
  }
}
