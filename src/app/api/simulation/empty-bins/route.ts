import { NextRequest } from 'next/server'

import { fail, ok } from '@/lib/api/response'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const warehouseId = req.nextUrl.searchParams.get('warehouseId')
  if (!warehouseId) {
    return fail('warehouseId query param is required.', 'VALIDATION_ERROR', 400)
  }

  const bins = await prisma.bin.findMany({
    where: {
      zone: { warehouseId },
      isBlocked: false,
      deletedAt: null,
      OR: [{ currentCapacity: 0 }, { currentCapacity: null }]
    },
    select: {
      id: true,
      name: true,
      code: true,
      zoneId: true,
      type: true,
      zone: { select: { name: true } }
    },
    orderBy: { name: 'asc' }
  })

  return ok(bins, 'Empty bins retrieved.')
}
