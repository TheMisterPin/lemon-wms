import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { authorizeDevice, deauthorizeDevice } from '@/lib/entities/devices/authorize-device'
import prisma from '@/lib/prisma'

const authorizeSchema = z.object({
  code: z.string().min(1, 'Device code is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  zoneId: z.string().min(1, 'Zone is required')
})

const deauthorizeSchema = z.object({
  code: z.string().min(1, 'Device code is required')
})

type RouteParams = { params: Promise<{ action: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can manage devices.', 'FORBIDDEN', 403)
  }

  const { action } = await params

  try {
    const body = await req.json()

    if (action === 'authorize') {
      const parsed = authorizeSchema.safeParse(body)
      if (!parsed.success) {
        return validationFail(parsed.error)
      }

      await authorizeDevice(prisma, {
        code: parsed.data.code,
        warehouseId: parsed.data.warehouseId,
        zoneId: parsed.data.zoneId,
        userId: payload.userId
      })

      return ok(null, 'Device authorized successfully.')
    }

    if (action === 'deauthorize') {
      const parsed = deauthorizeSchema.safeParse(body)
      if (!parsed.success) {
        return validationFail(parsed.error)
      }

      await deauthorizeDevice(prisma, parsed.data.code)

      return ok(null, 'Device deauthorized successfully.')
    }

    return fail(`Unknown action: ${action}`, 'BAD_REQUEST', 400)
  } catch (error) {
    console.error(`[POST /api/dashboard/devices/${action}]`, error)

    return fail(`Failed to ${action} device.`)
  }
}
