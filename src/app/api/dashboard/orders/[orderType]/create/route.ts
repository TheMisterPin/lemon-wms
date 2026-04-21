import { NextRequest } from 'next/server'

import {
  conflict,
  created,
  fail,
  forbidden,
  unauthorized,
  validationFail
} from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isOfficeRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { createPurchaseOrder } from '@/lib/orders/purchase'
import prisma from '@/lib/prisma'
import { purchaseOrderCreateSchema } from '@/lib/schemas/purchase-order-create'

type RouteParams = { params: Promise<{ orderType: string }> }

function isPrismaUniqueViolation(
  error: unknown
): error is { code: string; meta?: { target?: string | string[] } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === 'P2002'
  )
}

/**
 * @swagger
 * /api/dashboard/orders/{orderType}/create:
 *   post:
 *     summary: POST /api/dashboard/orders/{orderType}/create
 *     tags: [Dashboard]
 *     parameters:
 *       - in: path
 *         name: orderType
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Successful response
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isOfficeRole(payload.role)) {
    return forbidden('Only office users can create purchase orders.')
  }

  const { orderType } = await params
  if (orderType !== 'purchase') {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return fail('Invalid JSON body.', 'VALIDATION_ERROR', 400)
  }

  const parsed = purchaseOrderCreateSchema.safeParse(body)
  if (!parsed.success) {
    return validationFail(parsed.error)
  }

  try {
    const summary = await createPurchaseOrder(prisma, {
      ...parsed.data,
      createdById: payload.userId
    })

    return created(summary, 'Purchase order created successfully.')
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    if (isPrismaUniqueViolation(error)) {
      const target = error.meta?.target
      const fields = Array.isArray(target) ? target : typeof target === 'string' ? [target] : []

      if (fields.some(f => String(f).includes('reference'))) {
        return conflict('A purchase order with this reference already exists.')
      }

      return conflict('This record conflicts with an existing row.')
    }

    logAppError('[POST /api/dashboard/orders/[orderType]/create]', error)

    return fail('Failed to create purchase order.')
  }
}
