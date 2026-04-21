import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, notFound, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { deleteUser, getUser, updateUser, userFormSchema } from '@/lib/iam'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

/**
 * @swagger
 * /api/dashboard/users/{id}:
 *   get:
 *     summary: GET /api/dashboard/users/{id}
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

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can view user details.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const user = await getUser(prisma, id)
    if (!user) {
      return notFound('User')
    }

    return ok(user, 'User retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/dashboard/users/[id]]', error)

    return fail('Failed to retrieve user.')
  }
}

/**
 * @swagger
 * /api/dashboard/users/{id}:
 *   put:
 *     summary: PUT /api/dashboard/users/{id}
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

  if (payload.role !== 'OWNER' && payload.role !== 'OFFICE_MANAGER') {
    return fail('Only owners and office managers can update users.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  try {
    const existing = await getUser(prisma, id)
    if (!existing) {
      return notFound('User')
    }

    const body = await req.json()
    const parsed = userFormSchema.partial().parse(body)
    const user = await updateUser(prisma, id, parsed)

    return ok(user, 'User updated successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }
    logAppError('[PUT /api/dashboard/users/[id]]', error)

    return fail('Failed to update user.')
  }
}

/**
 * @swagger
 * /api/dashboard/users/{id}:
 *   delete:
 *     summary: DELETE /api/dashboard/users/{id}
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
    return fail('Only owners can delete users.', 'FORBIDDEN', 403)
  }

  const { id } = await params

  if (id === payload.userId) {
    return fail('You cannot delete your own account.', 'FORBIDDEN', 403)
  }

  try {
    const existing = await getUser(prisma, id)
    if (!existing) {
      return notFound('User')
    }

    const user = await deleteUser(prisma, id)

    return ok(user, 'User deactivated successfully.')
  } catch (error) {
    logAppError('[DELETE /api/dashboard/users/[id]]', error)

    return fail('Failed to deactivate user.')
  }
}
