import { NextResponse } from 'next/server'

import { refreshAccessToken } from '@/lib/entities/auth/refresh-token'
import { readRefreshTokenCookie } from '@/lib/auth/session'
import { DomainError } from '@/lib/errors'

export async function POST() {
  const rawRefreshToken = await readRefreshTokenCookie()

  try {
    const result = await refreshAccessToken(rawRefreshToken)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[POST /api/auth/refresh]', error)
    return NextResponse.json({ error: 'Token refresh failed.' }, { status: 500 })
  }
}
