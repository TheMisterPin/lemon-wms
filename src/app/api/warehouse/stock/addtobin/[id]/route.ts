import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import prisma from '@/lib/prisma'
import { createBinOperationsFromItem } from '@/lib/services/bin-operations'

type Params = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)

  if (!payload) {
    return unauthorized()
  }

  const { id } = await params
  const body = await req.json()
  const { quantity, itemId } = body
  if (typeof quantity !== 'number' || quantity <= 0) {
    return fail('Invalid quantity provided.', 'BAD_REQUEST', 400)
  }
  if (typeof itemId !== 'string' || !itemId) {
    return fail('Invalid itemId provided.', 'BAD_REQUEST', 400)
  }

  try {
    // For floor users the JWT carries warehouseId — use it to scope the lookup.
    // For office users it is absent, so look up any bin with this id.
    const bin = await prisma.bin.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(payload.warehouseId ? { warehouseId: payload.warehouseId } : {})
      }
    })

    if (!bin) {
      return fail('Bin not found.', 'NOT_FOUND', 404)
    }

    const baseItem = await prisma.item.findFirst({
      where: {
        id: itemId,
        deletedAt: null
      },
      select: {
        id: true,
        name: true,
        uom: true
      }

    })

    if (!baseItem) {
      return fail('Item not found.', 'NOT_FOUND', 404)
    }
    const binItem = await createBinOperationsFromItem({
      prisma,
      operation: 'adjustment',
      item: baseItem,
      binId: bin.id,
      userId: payload.userId,
      warehouseId: bin.warehouseId,
      quantity,
      orderType: 'ADJUSTMENT'
    })

    return ok({ bin, stockItems: binItem.stockItems }, 'Item added to bin successfully.')
  } catch (error) {
    console.error('[POST /api/warehouse/stock/addtobin/[id]]', error)

    return fail('Failed to add item to bin.')
  }
}
