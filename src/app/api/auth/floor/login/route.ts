import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { floorLogin } from '@/lib/auth/floor-login'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'

const loginSchema = z.object({
  deviceCode: z.string().trim().min(1),
  badgeNumber: z.string().trim().min(3),
  pin: z.string().trim().regex(/^\d{4}$/)
})

/**
 * @swagger
 * /api/auth/floor/login:
 *   post:
 *     summary: POST /api/auth/floor/login
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successful response
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  try {
    const result = await floorLogin(prisma, {
      ...parsed.data,
      ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    logAppError('[POST /api/auth/floor/login]', error)

    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
