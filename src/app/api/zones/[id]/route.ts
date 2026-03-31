import { NextRequest } from 'next/server'
import { z } from 'zod'

import { zoneFormSchema } from '@/lib/components/configs/entities/zone/schema'
import { fail, notFound, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { deleteZone } from '@/lib/entities/zones/delete-zone'
import { getZone } from '@/lib/entities/zones/get-zone'
import { updateZone } from '@/lib/entities/zones/update-zone'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) return unauthorized()

  const { id } = await params

  try {
    const zone = await getZone(prisma, id)
    if (!zone) return notFound('Zone')

    return ok(zone, 'Zone retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/zones/[id]]', error)

    return fail('Failed to retrieve zone.')
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) return unauthorized()

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can update zones.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getZone(prisma, id)
    if (!existing) return notFound('Zone')

    const body = await req.json()
    const parsed = zoneFormSchema.partial().parse(body)
    const zone = await updateZone(prisma, id, parsed)

    return ok(zone, 'Zone updated successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) return validationFail(error)
    console.error('[PUT /api/zones/[id]]', error)

    return fail('Failed to update zone.')
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) return unauthorized()

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can delete zones.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getZone(prisma, id)
    if (!existing) return notFound('Zone')

    const zone = await deleteZone(prisma, id)

    return ok(zone, 'Zone deleted successfully.')
  } catch (error) {
    console.error('[DELETE /api/zones/[id]]', error)

    return fail('Failed to delete zone.')
  }
}
