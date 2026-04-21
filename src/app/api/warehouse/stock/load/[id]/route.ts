import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'
import { loadItemsToTrolley } from '@/lib/stock'

type Params = { params: Promise<{ id: string }> }

const loadSchema = z.object({
  sourceBinStockItemId: z.string().min(1),
  quantity: z.number().positive()
})

/**
 * @swagger
 * /api/warehouse/stock/load/{id}:
 *   post:
 *     summary: POST /api/warehouse/stock/load/{id}
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
export async function POST(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }
  if (!payload.warehouseId) {
    return fail('Warehouse context is required for transit.', 'BAD_REQUEST', 400)
  }
  if (!payload.deviceId) {
    return fail('Device context is required for transit.', 'BAD_REQUEST', 400)
  }

  const { id: binId } = await params

  try {
    const body = await req.json()
    const parsed = loadSchema.parse(body)

    const sourceBin = await prisma.bin.findFirst({
      where: {
        id: binId,
        warehouseId: payload.warehouseId,
        deletedAt: null
      },
      select: { id: true }
    })
    if (!sourceBin) {
      return fail('Source bin not found.', 'NOT_FOUND', 404)
    }

    const result = await loadItemsToTrolley({
      prisma,
      userId: payload.userId,
      warehouseId: payload.warehouseId,
      deviceId: payload.deviceId,
      sourceBinStockItemId: parsed.sourceBinStockItemId,
      quantity: parsed.quantity
    })

    return ok(
      {
        boeId: result.boes[0]?.id ?? null,
        transitBinStockItemId: result.transitStockItem.id
      },
      'Item loaded to trolley successfully.'
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }
    if (error instanceof Error) {
      return fail(error.message, 'BAD_REQUEST', 400)
    }

    logAppError('[POST /api/warehouse/stock/load/[id]]', error)

    return fail('Failed to load item to trolley.')
  }
}
