import { NextRequest } from 'next/server'
import { z } from 'zod'

import { created, fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { binFormSchema } from '@/lib/components/configs/entities/bin/schema'
import { createBin } from '@/lib/entities/bins/create-bin'
import { getBins } from '@/lib/entities/bins/get-bins'
import { DomainError } from '@/lib/errors'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  try {
    const { searchParams } = new URL(req.url)
    const zoneId = searchParams.get('zoneId') ?? undefined
    const warehouseId = searchParams.get('warehouseId') ?? undefined
    const bins = await getBins(prisma, { zoneId, warehouseId })

    return ok(bins, 'Bins retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/bins]', error)

    return fail('Failed to retrieve bins.')
  }
}

export async function POST(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can create bins.', 'FORBIDDEN', 403)
  }

  try {
    const body = await req.json()
    const parsed = binFormSchema.parse(body)
    const bin = await createBin(prisma, parsed)

    return created(bin, 'Bin created successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }

    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    console.error('[POST /api/bins]', error)

    return fail('Failed to create bin.')
  }
}
