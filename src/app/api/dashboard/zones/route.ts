import { NextRequest } from 'next/server'
import { z } from 'zod'

import { created, fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { createZone } from '@/lib/entities/zones/create-zone'
import { getZones } from '@/lib/entities/zones/get-zones'
import { DomainError } from '@/lib/errors'
import prisma from '@/lib/prisma'
import { zoneFormSchema } from '@/lib/schemas/zone'
import { toZoneTableRecords } from '@/utils/converters/table-records'

/**
 * @swagger
 * /api/dashboard/zones:
 *   get:
 *     summary: GET /api/dashboard/zones
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  try {
    const { searchParams } = new URL(req.url)
    const warehouseId = searchParams.get('warehouseId') ?? undefined
    const zoneRecords = await getZones(prisma, { warehouseId })
    const zones = toZoneTableRecords(zoneRecords)

    return ok(zones, 'Zones retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/zones]', error)

    return fail('Failed to retrieve zones.')
  }
}

/**
 * @swagger
 * /api/dashboard/zones:
 *   post:
 *     summary: POST /api/dashboard/zones
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can create zones.', 'FORBIDDEN', 403)
  }

  try {
    const body = await req.json()
    const parsed = zoneFormSchema.parse(body)
    const zone = await createZone(prisma, parsed)

    return created(zone, 'Zone created successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }

    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    console.error('[POST /api/dashboard/zones]', error)

    return fail('Failed to create zone.')
  }
}
