import { NextRequest } from 'next/server'
import { z } from 'zod'

import { created, fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { itemFormSchema } from '@/lib/schemas/item'
import { createItem } from '@/lib/entities/items/create-item'
import { getItems } from '@/lib/entities/items/get-items'
import prisma from '@/lib/prisma'

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
    const items = await getItems(prisma, { categoryId, isActive })

    return ok(items, 'Items retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/items]', error)

    return fail('Failed to retrieve items.')
  }
}

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

    console.error('[POST /api/items]', error)

    return fail('Failed to create item.')
  }
}
