import { NextRequest } from 'next/server'
import { z } from 'zod'

import { created, fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { createItem, getItemsWithFilters } from '@/lib/catalog/items/items-queries'
import { itemFormSchema } from '@/lib/catalog/items/items-schemas'
import prisma from '@/lib/prisma'
import { toItemTableRecords } from '@/utils/converters/table-records'

/**
 * @swagger
 * /api/dashboard/items:
 *   get:
 *     summary: GET /api/dashboard/items
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
    const categoryId = searchParams.get('categoryId') ?? undefined
    const isActiveParam = searchParams.get('isActive')
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined
    const itemRecords = await getItemsWithFilters(prisma, { categoryId, isActive })

    return ok({ items: toItemTableRecords(itemRecords) }, 'Items retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/items]', error)

    return fail('Failed to retrieve items.')
  }
}

/**
 * @swagger
 * /api/dashboard/items:
 *   post:
 *     summary: POST /api/dashboard/items
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
    return fail('Only office users can create items.', 'FORBIDDEN', 403)
  }

  try {
    const body = await req.json()
    const parsed = itemFormSchema.parse(body)
    const item = await createItem(prisma, parsed)

    return created(item, 'Item created successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }

    if (error instanceof Error) {
      return fail(error.message, 'VALIDATION_ERROR', 400)
    }

    console.error('[POST /api/dashboard/items]', error)

    return fail('Failed to create item.')
  }
}
