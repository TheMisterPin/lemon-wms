import { NextRequest } from 'next/server'
import { z } from 'zod'

import { created, fail, ok, unauthorized, validationFail } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { toDeviceTableRecords } from '@/lib/converters/table-records'
import { createDevice } from '@/lib/entities/devices/create-device'
import { getFilteredDevices } from '@/lib/entities/devices/get-devices'
import prisma from '@/lib/prisma'

const createDeviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  warehouseId: z.string().nullable().optional(),
  zoneId: z.string().nullable().optional(),
  authorized: z.boolean().default(false),
  isActive: z.boolean().default(true)
})

export async function GET(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  try {
    const { searchParams } = new URL(req.url)

    const authorizedParam = searchParams.get('authorized')
    const warehouseId = searchParams.get('warehouseId') ?? undefined
    const zoneId = searchParams.get('zoneId') ?? undefined
    const isActiveParam = searchParams.get('isActive')

    const filters = {
      ...(authorizedParam !== null ? { authorized: authorizedParam === 'true' } : {}),
      ...(warehouseId ? { warehouseId } : {}),
      ...(zoneId ? { zoneId } : {}),
      ...(isActiveParam !== null ? { isActive: isActiveParam === 'true' } : {})
    }

    const deviceRecords = await getFilteredDevices(prisma, Object.keys(filters).length ? filters : undefined)
    const devices = toDeviceTableRecords(deviceRecords)

    return ok(devices, 'Devices retrieved successfully.')
  } catch (error) {
    console.error('[GET /api/dashboard/devices]', error)

    return fail('Failed to retrieve devices.')
  }
}

export async function POST(req: NextRequest) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return fail('Only office users can register devices.', 'FORBIDDEN', 403)
  }

  try {
    const body = await req.json()
    const parsed = createDeviceSchema.parse(body)
    const device = await createDevice(prisma, {
      name: parsed.name,
      code: parsed.code,
      warehouseId: parsed.warehouseId ?? null,
      zoneId: parsed.zoneId ?? null,
      authorized: parsed.authorized,
      isActive: parsed.isActive
    })

    return created(device, 'Device registered successfully.')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return validationFail(error)
    }
    console.error('[POST /api/dashboard/devices]', error)

    return fail('Failed to register device.')
  }
}
