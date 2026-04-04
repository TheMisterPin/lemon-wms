import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getItemsInBin } from '@/lib/entities/stock'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)

  if (!payload) {
    return unauthorized()
  }

  const { id } = await params

  try {
    const bin = await prisma.bin.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(payload.warehouseId ? { warehouseId: payload.warehouseId } : {})
      },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        zoneId: true,
        warehouseId: true,
        currentCapacity: true,
        maxCapacity: true,
        isBlocked: true,
        blockReason: true
      }
    })

    if (!bin) {
      return fail('Bin not found.', 'NOT_FOUND', 404)
    }

    const items = await getItemsInBin(prisma, bin.id)

    return ok({ bin, items }, 'Bin details retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/warehouse/bins/[id]]', error)

    return fail('Failed to retrieve bin details.')
  }
}
