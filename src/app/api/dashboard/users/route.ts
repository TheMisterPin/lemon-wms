import { NextRequest } from 'next/server'
import { z } from 'zod'

import { created, fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { createUser, getUsers, userFormSchema } from '@/lib/iam'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'
import { toUserTableRecords } from '@/utils/converters/table-records'

/**
 * @swagger
 * /api/dashboard/users:
 *   get:
 *     summary: GET /api/dashboard/users
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

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can view the user list.', 'FORBIDDEN', 403)
  }

  try {
    const userRecords = await getUsers(prisma)
    const users = toUserTableRecords(userRecords)

    return ok(users, 'Users retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/dashboard/users]', error)

    return fail('Failed to retrieve users.')
  }
}

/**
 * @swagger
 * /api/dashboard/users:
 *   post:
 *     summary: POST /api/dashboard/users
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

  if (payload.role !== 'OWNER' && payload.role !== 'OFFICE_MANAGER') {
    return fail('Only owners and office managers can create users.', 'FORBIDDEN', 403)
  }

  try {
    const body = await req.json()
    const parsed = userFormSchema.parse(body)
    const user = await createUser(prisma, parsed)

    return created(user, 'User created successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }
    logAppError('[POST /api/dashboard/users]', error)

    return fail('Failed to create user.')
  }
}
