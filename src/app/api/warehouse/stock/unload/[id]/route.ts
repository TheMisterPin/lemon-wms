import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { unloadItemsFromTrolley } from '@/lib/entities/move-operations'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

const unloadSelectionSchema = z.object({
  transitBinStockItemId: z.string().min(1),
  quantity: z.number().positive().optional()
})

const unloadSchema = z.object({
  selections: z.array(unloadSelectionSchema).min(1)
})

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

    console.error('[POST /api/warehouse/stock/unload/[id]]', error)

    return fail('Failed to unload trolley items.')
  }
}
