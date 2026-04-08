import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, notFound, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { getItemsForVendor } from '@/lib/entities/business-parties'
import prisma from '@/lib/prisma'

const pathIdSchema = z.string().trim().min(1)

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  const { id } = await params
  const idResult = pathIdSchema.safeParse(id)
  if (!idResult.success) {
    return validationFail(idResult.error)
  }

  try {
    const items = await getItemsForVendor(prisma, idResult.data)
    if (items === null) {
      return notFound('Supplier')
    }

    return ok(items, 'Supplier items retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/business-parties/[id]]', error)

    return fail('Failed to retrieve supplier items.')
  }
}
