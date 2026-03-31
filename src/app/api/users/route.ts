import { NextRequest } from 'next/server'
import { z } from 'zod'

import { userFormSchema } from '@/lib/components/configs/entities/user/schema'
import { created, fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { createUser } from '@/lib/entities/users/create-user'
import { getUsers } from '@/lib/entities/users/get-users'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) return unauthorized()

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can view the user list.', 'FORBIDDEN', 403)
  }

  try {
    const users = await getUsers(prisma)

    return ok(users, 'Users retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/users]', error)

    return fail('Failed to retrieve users.')
  }
}

export async function POST(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) return unauthorized()

  if (payload.role !== 'OWNER' && payload.role !== 'OFFICE_MANAGER') {
    return fail('Only owners and office managers can create users.', 'FORBIDDEN', 403)
  }

  try {
    const body = await req.json()
    const parsed = userFormSchema.parse(body)
    const user = await createUser(prisma, parsed)

    return created(user, 'User created successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) return validationFail(error)
    console.error('[POST /api/users]', error)

    return fail('Failed to create user.')
  }
}
