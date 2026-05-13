import { fail, ok } from '@/lib/api/response'
import prisma from '@/lib/prisma'

export async function GET() {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const users = await prisma.user.findMany({
    where: {
      isActive: true,
      deletedAt: null,
      role: { in: ['WAREHOUSE_MANAGER', 'WAREHOUSE_WORKER'] },
      loginType: { in: ['BADGE_PIN', 'BOTH'] }
    },
    select: { id: true, fullName: true, badgeNumber: true, role: true },
    orderBy: { fullName: 'asc' }
  })

  return ok(users, 'Users retrieved.')
}
