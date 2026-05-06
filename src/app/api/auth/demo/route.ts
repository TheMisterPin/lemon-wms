import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { Role } from '@/generated/prisma'
import { demoLogin } from '@/lib/auth/demo-login'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'

const demoSchema = z.object({
  role: z.nativeEnum(Role)
})

const isDemoModeEnabled = (): boolean => process.env.IS_DEMO === 'true'

/**
 * POST /api/auth/demo — instant login as the first active user with the given role.
 * Only available when IS_DEMO=true.
 */
export async function POST(request: NextRequest) {
  if (!isDemoModeEnabled()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const parsed = demoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  try {
    const result = await demoLogin(prisma, {
      role: parsed.data.role,
      ipAddress: request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    logAppError('[POST /api/auth/demo]', error)

    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
