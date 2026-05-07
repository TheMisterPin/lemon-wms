import type { NextRequest } from 'next/server'

import { fail, notFound, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { getDeviceDetailDashboardData } from '@/lib/pages/dashboard/get-device-detail-dashboard-data'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ deviceId: string }> }

export async function GET(req: NextRequest, { params }: Params): Promise<Response> {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  const { deviceId } = await params

  try {
    const data = await getDeviceDetailDashboardData(prisma, deviceId)

    return ok(data, 'Device overview retrieved successfully.')
  } catch (error) {
    if (error instanceof DomainError) {
      if (error.code === 'NOT_FOUND') {
        return notFound('Device')
      }

      return fail(error.message, error.code, error.status)
    }

    logAppError('[GET /api/dashboard/devices/overview/[deviceId]]', error)

    return fail('Failed to load device overview.')
  }
}
