import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { credentialLogin } from '@/lib/auth/credential-login'
import { DomainError } from '@/lib/errors'
import prisma from '@/lib/prisma'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: POST /api/auth/login
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
    const result = await credentialLogin(prisma, {
      ...parsed.data,
      ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[POST /api/auth/login]', error)

    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
