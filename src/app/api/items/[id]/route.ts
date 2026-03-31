import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, notFound, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { itemFormSchema } from '@/lib/components/configs/entities/item/schema'
import { deleteItem } from '@/lib/entities/items/delete-item'
import { getItem } from '@/lib/entities/items/get-item'
import { updateItem } from '@/lib/entities/items/update-item'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  const { id } = await params

  try {
    const item = await getItem(prisma, id)
    if (!item) {
      return notFound('Item')
    }

    return ok(item, 'Item retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/items/[id]]', error)

    return fail('Failed to retrieve item.')
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can update items.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getItem(prisma, id)
    if (!existing) {
      return notFound('Item')
    }

    const body = await req.json()
    const parsed = itemFormSchema.partial().parse(body)
    const item = await updateItem(prisma, id, parsed)

    return ok(item, 'Item updated successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }
    console.error('[PUT /api/items/[id]]', error)

    return fail('Failed to update item.')
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (payload.role !== 'OWNER' && payload.role !== 'OFFICE_MANAGER') {
    return fail('Only owners and office managers can delete items.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getItem(prisma, id)
    if (!existing) {
      return notFound('Item')
    }

    const item = await deleteItem(prisma, id)

    return ok(item, 'Item archived successfully.')
  } catch (error) {
    console.error('[DELETE /api/items/[id]]', error)

    return fail('Failed to archive item.')
  }
}
