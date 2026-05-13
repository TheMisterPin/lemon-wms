import { NextRequest } from 'next/server'
import { z } from 'zod'

import { fail, ok } from '@/lib/api/response'
import { signAccessToken } from '@/lib/auth/jwt'
import prisma from '@/lib/prisma'

const floorTokenSchema = z.object({
  userId: z.string().min(1),
  orderId: z.string().min(1)
})

export async function POST(req: NextRequest) {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const body = await req.json().catch(() => null)
  const parsed = floorTokenSchema.safeParse(body)
  if (!parsed.success) {
    return fail('userId and orderId are required.', 'VALIDATION_ERROR', 400)
  }

  const { userId, orderId } = parsed.data

  const [user, order] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, isActive: true, loginType: true }
    }),
    prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      select: { warehouseId: true }
    })
  ])

  if (!user || !user.isActive) {
    return fail('User not found or inactive.', 'NOT_FOUND', 404)
  }

  if (user.loginType !== 'BADGE_PIN' && user.loginType !== 'BOTH') {
    return fail('User does not support floor login.', 'VALIDATION_ERROR', 400)
  }

  if (!order?.warehouseId) {
    return fail('Order not found.', 'NOT_FOUND', 404)
  }

  const device = await prisma.device.findFirst({
    where: {
      warehouseId: order.warehouseId,
      authorized: true,
      isActive: true,
      zoneId: { not: null }
    },
    select: { id: true, warehouseId: true, zoneId: true }
  })

  if (!device?.warehouseId || !device.zoneId) {
    return fail(
      'No authorized device found for this warehouse.',
      'NOT_FOUND',
      404
    )
  }

  const accessToken = signAccessToken({
    userId: user.id,
    role: user.role,
    warehouseId: device.warehouseId,
    zoneId: device.zoneId,
    deviceId: device.id
  })

  return ok(
    {
      accessToken,
      warehouseId: device.warehouseId,
      zoneId: device.zoneId,
      deviceId: device.id
    },
    'Floor token issued.'
  )
}
