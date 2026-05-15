import { NextRequest } from 'next/server'

import { fail, notFound, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getBinWithContent } from '@/lib/locations'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

/**
 * GET /api/warehouse/bins/[id] — bin metadata and content lines (same shape as dashboard bin API).
 */
export async function GET(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)

  if (!payload) {
    return unauthorized()
  }

  const { id } = await params

  try {
    const bin = await getBinWithContent(prisma, id)
    if (!bin) {
      return notFound('Bin')
    }

    if (payload.warehouseId && bin.warehouseId !== payload.warehouseId) {
      return notFound('Bin')
    }

    return ok(bin, 'Bin retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/warehouse/bins/[id]]', error)

    return fail('Failed to retrieve bin details.')
  }
}
