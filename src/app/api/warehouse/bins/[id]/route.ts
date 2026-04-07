import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getItemsInBin } from '@/lib/services/bin-operations'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

function toNumberOrZero(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 0
}

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
    const normalizedBin = {
      ...bin,
      currentCapacity: toNumberOrZero(bin.currentCapacity),
      maxCapacity: toNumberOrZero(bin.maxCapacity)
    }
    const normalizedItems = items.map((item) => ({
      ...item,
      quantityAvailable: item.quantityAvailable,
      quantityReserved: item.quantityReserved,
      quantityBlocked: item.quantityBlocked
    }))

    return ok({ bin: normalizedBin, items: normalizedItems }, 'Bin details retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/warehouse/bins/[id]]', error)

    return fail('Failed to retrieve bin details.')
  }
}
