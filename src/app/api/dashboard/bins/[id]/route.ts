import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, notFound, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { deleteBin, getBin, getBinWithContent, updateBin, binFormSchema } from '@/lib/locations'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

/**
 * @swagger
 * /api/dashboard/bins/{id}:
 *   get:
 *     summary: GET /api/dashboard/bins/{id}
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
    const bin = await getBinWithContent(prisma, id)
    if (!bin) {
      return notFound('Bin')
    }

    return ok(bin, 'Bin retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/bins/[id]]', error)

    return fail('Failed to retrieve bin.')
  }
}

/**
 * @swagger
 * /api/dashboard/bins/{id}:
 *   put:
 *     summary: PUT /api/dashboard/bins/{id}
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

/**
 * @swagger
 * /api/dashboard/bins/{id}:
 *   delete:
 *     summary: DELETE /api/dashboard/bins/{id}
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
