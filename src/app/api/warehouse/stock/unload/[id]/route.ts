import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'
import { unloadItemsFromTrolley } from '@/lib/stock/bin-stock-items/bin-stock-items-mutations'

type Params = { params: Promise<{ id: string }> }

const unloadSelectionSchema = z.object({
  transitBinStockItemId: z.string().min(1),
  quantity: z.number().positive().optional()
})

const unloadSchema = z.object({
  selections: z.array(unloadSelectionSchema).min(1)
})

/**
 * @swagger
 * /api/warehouse/stock/unload/{id}:
 *   post:
 *     summary: POST /api/warehouse/stock/unload/{id}
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

  const { id: toBinId } = await params

  try {
    const body = await req.json()
    const parsed = unloadSchema.parse(body)

    const toBin = await prisma.bin.findFirst({
      where: {
        id: toBinId,
        warehouseId: payload.warehouseId,
        deletedAt: null
      },
      select: { id: true }
    })
    if (!toBin) {
      return fail('Destination bin not found.', 'NOT_FOUND', 404)
    }

    const result = await unloadItemsFromTrolley({
      prisma,
      userId: payload.userId,
      warehouseId: payload.warehouseId,
      toBinId,
      selections: parsed.selections
    })

    return ok(result, 'Items unloaded from trolley successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }
    if (error instanceof Error) {
      return fail(error.message, 'BAD_REQUEST', 400)
    }

    logAppError('[POST /api/warehouse/stock/unload/[id]]', error)

    return fail('Failed to unload trolley items.')
  }
}
