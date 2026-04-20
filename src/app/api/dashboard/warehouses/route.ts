import { NextRequest } from 'next/server'
import { z } from 'zod'

import { created, fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { createWarehouse } from '@/lib/entities/warehouses/create-warehouse'
import { getWarehouses } from '@/lib/entities/warehouses/get-warehouses'
import prisma from '@/lib/prisma'
import { warehouseFormSchema } from '@/lib/schemas/warehouse'
import { toWarehouseTableRecords } from '@/utils/converters/table-records'
import { generateWarehouseSerial } from '@/utils/serials'

/**
 * @swagger
 * /api/dashboard/warehouses:
 *   get:
 *     summary: GET /api/dashboard/warehouses
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
    const records = await getWarehouses(prisma)
    const data = toWarehouseTableRecords(records)

    return ok(data, 'Warehouses retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/warehouses]', error)

    return fail('Failed to retrieve warehouses.')
  }
}

/**
 * @swagger
 * /api/dashboard/warehouses:
 *   post:
 *     summary: POST /api/dashboard/warehouses
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
    return fail('Only office users can create warehouses.', 'FORBIDDEN', 403)
  }

  try {
    const body = await req.json()
    const parsed = warehouseFormSchema.parse(body)
    const id = await generateWarehouseSerial(prisma)
    const warehouse = await createWarehouse(prisma, {
      ...parsed,
      createdById: payload.userId,
      id: id
    })

    return created(warehouse, 'Warehouse created successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }
    console.error('[POST /api/dashboard/warehouses]', error)

    return fail('Failed to create warehouse.')
  }
}
