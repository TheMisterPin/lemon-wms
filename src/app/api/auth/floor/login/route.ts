import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { floorLogin } from '@/lib/entities/auth/floor-login'
import { DomainError } from '@/lib/errors'
import prisma from '@/lib/prisma'

const loginSchema = z.object({
  deviceCode: z.string().min(1),
  badgeNumber: z.string().min(3),
  pin: z.string().regex(/^\d{4}$/)
})

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
    console.error('[POST /api/auth/floor/login]', error)
    return NextResponse.json({ error: 'Login failed.' }, { status: 500 })
  }
}
