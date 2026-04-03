import { NextRequest, NextResponse } from 'next/server'

import { unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'

export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)

  if (!payload) {
    return unauthorized()
  }

  return NextResponse.json({
    success: true,
    user: payload // optional, useful for debugging / frontend
  })
}
