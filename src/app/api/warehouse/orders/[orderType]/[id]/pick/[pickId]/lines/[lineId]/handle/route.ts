import { NextRequest } from 'next/server'
import { z } from 'zod'

import { Prisma, ReceiptOutcome, ReceiptStatus } from '@/generated/prisma'
import { withIdempotency } from '@/lib/api/idempotency'
import { fail, forbidden, ok, unauthorized } from '@/lib/api/response'
import { verifyAccessTokenFromRequest, isFloorRole } from '@/lib/auth/middleware'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import { confirmSalesPickLineHandled } from '@/lib/orders/sales/sales-pick/sales-pick-mutations'
import prisma from '@/lib/prisma'

const handleLineSchema = z.object({
  quantity: z.number().positive(),
  disposition: z.nativeEnum(ReceiptOutcome).default('ACCEPTED'),
  notes: z.string().optional().nullable(),
  orderAssignmentId: z.string().min(1),
  activityNotes: z.string().optional().nullable()
})

type RouteParams = {
  params: Promise<{ orderType: string; id: string; pickId: string; lineId: string }>
}

/**
 * @swagger
 * /api/warehouse/orders/{orderType}/{id}/pick/{pickId}/lines/{lineId}/handle:
 *   post:
 *     summary: Declare quantity picked on a sales order pick line
 *     tags: [Warehouse]
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const payload = verifyAccessTokenFromRequest(req)
  if (!payload) {
    return unauthorized()
  }

  if (!isFloorRole(payload.role)) {
    return forbidden('Only warehouse users can handle pick lines.')
  }

  const { orderType, id: rawId, pickId, lineId } = await params

  if (orderType !== 'sales') {
    return fail('Unsupported order type.', 'VALIDATION_ERROR', 400)
  }

  const id = rawId?.trim()
  if (!id || !pickId || !lineId) {
    return fail('Order id, pick id, and line id are required.', 'VALIDATION_ERROR', 400)
  }

  if (!payload.warehouseId) {
    return fail('Warehouse context is required.', 'VALIDATION_ERROR', 400)
  }

  const warehouseId = payload.warehouseId

  const body = await req.json().catch(() => null)
  const parsed = handleLineSchema.safeParse(body)
  if (!parsed.success) {
    return fail('Validation failed.', 'VALIDATION_ERROR', 400)
  }

  const { quantity, disposition, notes, orderAssignmentId, activityNotes } = parsed.data

  const idempotencyKey = req.headers.get('Idempotency-Key')?.trim()
  if (!idempotencyKey) {
    return fail('Idempotency-Key header is required.', 'IDEMPOTENCY_KEY_REQUIRED', 400)
  }

  return withIdempotency(
    prisma,
    { scope: `pick-line:handle:${pickId}:${lineId}`, idempotencyKey, body: parsed.data, userId: payload.userId },
    async () => {
      try {
        const pickLine = await prisma.salesOrderPickLine.findUnique({
          where: { id: lineId },
          select: {
            pick: {
              select: {
                id: true,
                warehouseId: true,
                salesOrderId: true,
                status: true
              }
            }
          }
        })

        if (!pickLine) {
          return fail('Pick line not found.', 'NOT_FOUND', 404)
        }

        if (pickLine.pick.salesOrderId !== id) {
          return fail('Pick line does not belong to this sales order.', 'INVALID_STATE', 400)
        }

        if (pickLine.pick.warehouseId !== warehouseId) {
          return fail('Pick does not belong to your warehouse.', 'FORBIDDEN', 403)
        }

        if (
          pickLine.pick.status === ReceiptStatus.COMPLETED ||
          pickLine.pick.status === ReceiptStatus.COMPLETED_WITH_PROBLEMS
        ) {
          return fail('Pick is already completed.', 'INVALID_STATE', 409)
        }

        if (pickLine.pick.status === ReceiptStatus.OPEN) {
          await prisma.salesOrderPick.updateMany({
            where: { id: pickId, status: ReceiptStatus.OPEN },
            data: {
              status: ReceiptStatus.IN_PROGRESS,
              startedById: payload.userId,
              startedAt: new Date()
            }
          })
        }

        const result = await confirmSalesPickLineHandled(prisma, {
          pickLineId: lineId,
          quantity: new Prisma.Decimal(quantity),
          disposition,
          notes: notes ?? null,
          orderAssignmentId,
          userId: payload.userId,
          warehouseId,
          activityNotes: activityNotes ?? null
        })

        if (!result.success) {
          return fail(result.error, result.code ?? 'DOMAIN_ERROR', 409)
        }

        const updatedPick = await prisma.salesOrderPick.findUnique({
          where: { id: pickId },
          select: { status: true }
        })

        return ok(
          {
            orderExecutionActivityId: result.orderExecutionActivityId,
            pickLineId: lineId,
            pickStatus: updatedPick?.status ?? null
          },
          'Pick line handled.'
        )
      } catch (error) {
        if (error instanceof DomainError) {
          return fail(error.message, error.code, error.status)
        }

        logAppError('[POST /api/warehouse/orders/[orderType]/[id]/pick/[pickId]/lines/[lineId]/handle]', error)

        return fail('Failed to handle pick line.')
      }
    }
  )
}
