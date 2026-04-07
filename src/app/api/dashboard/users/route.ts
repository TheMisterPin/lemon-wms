import { NextRequest } from 'next/server'
import { z } from 'zod'

import { created, fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { toUserTableRecords } from '@/lib/converters/table-records'
import { createUser } from '@/lib/entities/users/create-user'
import { getUsers } from '@/lib/entities/users/get-users'
import prisma from '@/lib/prisma'
import { userFormSchema } from '@/lib/schemas/user'

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
    console.error('[GET /api/dashboard/users]', error)

    return fail('Failed to retrieve users.')
  }
}

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
    console.error('[POST /api/dashboard/users]', error)

    return fail('Failed to create user.')
  }
}
