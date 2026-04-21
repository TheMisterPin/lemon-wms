import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, notFound, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { deleteWarehouse, getWarehouse, updateWarehouse, warehouseFormSchema } from '@/lib/locations'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

/**
 * @swagger
 * /api/dashboard/warehouses/{id}:
 *   get:
 *     summary: GET /api/dashboard/warehouses/{id}
 *     tags: [Dashboard]
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
    const warehouse = await getWarehouse(prisma, id)
    if (!warehouse) {
      return notFound('Warehouse')
    }

    return ok(warehouse, 'Warehouse retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/warehouses/[id]]', error)

    return fail('Failed to retrieve warehouse.')
  }
}

/**
 * @swagger
 * /api/dashboard/warehouses/{id}:
 *   put:
 *     summary: PUT /api/dashboard/warehouses/{id}
 *     tags: [Dashboard]
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
export async function PUT(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can update warehouses.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getWarehouse(prisma, id)
    if (!existing) {
      return notFound('Warehouse')
    }

    const body = await req.json()
    const parsed = warehouseFormSchema.partial().parse(body)
    const warehouse = await updateWarehouse(prisma, id, parsed)

    return ok(warehouse, 'Warehouse updated successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }
    console.error('[PUT /api/dashboard/warehouses/[id]]', error)

    return fail('Failed to update warehouse.')
  }
}

/**
 * @swagger
 * /api/dashboard/warehouses/{id}:
 *   delete:
 *     summary: DELETE /api/dashboard/warehouses/{id}
 *     tags: [Dashboard]
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
export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (payload.role !== 'OWNER') {
    return fail('Only owners can delete warehouses.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getWarehouse(prisma, id)
    if (!existing) {
      return notFound('Warehouse')
    }

    const warehouse = await deleteWarehouse(prisma, id)

    return ok(warehouse, 'Warehouse archived successfully.')
  } catch (error) {
    console.error('[DELETE /api/dashboard/warehouses/[id]]', error)

    return fail('Failed to archive warehouse.')
  }
}
