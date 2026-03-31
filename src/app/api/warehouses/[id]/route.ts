import { NextRequest } from 'next/server'
import { z } from 'zod'

import { warehouseFormSchema } from '@/lib/components/configs/entities/warehouse/schema'
import { fail, notFound, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { deleteWarehouse } from '@/lib/entities/warehouses/delete-warehouse'
import { getWarehouse } from '@/lib/entities/warehouses/get-warehouse'
import { updateWarehouse } from '@/lib/entities/warehouses/update-warehouse'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) return unauthorized()

  const { id } = await params

  try {
    const warehouse = await getWarehouse(prisma, id)
    if (!warehouse) return notFound('Warehouse')

    return ok(warehouse, 'Warehouse retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/warehouses/[id]]', error)

    return fail('Failed to retrieve warehouse.')
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) return unauthorized()

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can update warehouses.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getWarehouse(prisma, id)
    if (!existing) return notFound('Warehouse')

    const body = await req.json()
    const parsed = warehouseFormSchema.partial().parse(body)
    const warehouse = await updateWarehouse(prisma, id, parsed)

    return ok(warehouse, 'Warehouse updated successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) return validationFail(error)
    console.error('[PUT /api/warehouses/[id]]', error)

    return fail('Failed to update warehouse.')
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) return unauthorized()

  if (payload.role !== 'OWNER') {
    return fail('Only owners can delete warehouses.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getWarehouse(prisma, id)
    if (!existing) return notFound('Warehouse')

    const warehouse = await deleteWarehouse(prisma, id)

    return ok(warehouse, 'Warehouse archived successfully.')
  } catch (error) {
    console.error('[DELETE /api/warehouses/[id]]', error)

    return fail('Failed to archive warehouse.')
  }
}
