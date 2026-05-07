import { NextRequest } from 'next/server'

import { forbidden, ok, unauthorized } from '@/lib/api/response'
import { isOfficeRole, verifyAccessTokenFromRequest } from '@/lib/auth/middleware'
import { logAppError } from '@/lib/logs/app-logger'
import { getDevicesDashboardData } from '@/lib/pages/dashboard/get-devices-dashboard-data'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return forbidden('Only office users can access the devices dashboard.')
  }

  try {
    const { searchParams } = new URL(req.url)
    const data = await getDevicesDashboardData(prisma, {
      warehouseId: searchParams.get('warehouseId') ?? undefined,
      authorizationStatus:
        (searchParams.get('authorizationStatus') as 'AUTHORIZED' | 'PENDING' | 'REJECTED' | null) ?? undefined,
      onlineStatus:
        (searchParams.get('onlineStatus') as 'ACTIVE' | 'IDLE' | 'OFFLINE' | null) ?? undefined,
      assignedUserId: searchParams.get('assignedUserId') ?? undefined
    })

    return ok(data, 'Devices dashboard retrieved successfully.')
  } catch (error) {
    logAppError('[GET /api/dashboard/devices/overview]', error)

    return forbidden('Failed to load devices dashboard.')
  }
}
