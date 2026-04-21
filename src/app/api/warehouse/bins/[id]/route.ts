import { NextRequest } from 'next/server'

import { fail, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'
import { getItemsInBin } from '@/lib/stock/bin-stock-items/bin-stock-items-queries'

type Params = { params: Promise<{ id: string }> }

/**
 * @swagger
 * /api/warehouse/bins/{id}:
 *   get:
 *     summary: GET /api/warehouse/bins/{id}
 *     tags: [Warehouse]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response
 */
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
      currentCapacity: Number(bin.currentCapacity) || 0,
      maxCapacity: Number(bin.maxCapacity) || 0
    }
    const normalizedItems = items.map((item) => ({
      ...item,
      quantityAvailable: Number(item.quantityAvailable) || 0,
      quantityReserved: Number(item.quantityReserved) || 0,
      quantityBlocked: Number(item.quantityBlocked) || 0
    }))

    return ok({ bin: normalizedBin, items: normalizedItems }, 'Bin details retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/warehouse/bins/[id]]', error)

    return fail('Failed to retrieve bin details.')
  }
}
