import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, notFound, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { binFormSchema } from '@/lib/schemas/bin'
import { deleteBin } from '@/lib/entities/bins/delete-bin'
import { getBin } from '@/lib/entities/bins/get-bin'
import { updateBin } from '@/lib/entities/bins/update-bin'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  const { id } = await params

  try {
    const bin = await getBin(prisma, id)
    if (!bin) {
      return notFound('Bin')
    }

    return ok(bin, 'Bin retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/bins/[id]]', error)

    return fail('Failed to retrieve bin.')
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can update bins.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getBin(prisma, id)
    if (!existing) {
      return notFound('Bin')
    }

    const body = await req.json()
    const parsed = binFormSchema.partial().parse(body)
    const bin = await updateBin(prisma, id, parsed)

    return ok(bin, 'Bin updated successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }
    console.error('[PUT /api/dashboard/bins/[id]]', error)

    return fail('Failed to update bin.')
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can delete bins.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getBin(prisma, id)
    if (!existing) {
      return notFound('Bin')
    }

    const bin = await deleteBin(prisma, id)

    return ok(bin, 'Bin deleted successfully.')
  } catch (error) {
    console.error('[DELETE /api/dashboard/bins/[id]]', error)

    return fail('Failed to delete bin.')
  }
}
