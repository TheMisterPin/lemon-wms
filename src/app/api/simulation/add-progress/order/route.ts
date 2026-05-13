import { NextRequest } from 'next/server'
import { z } from 'zod'

import { OrderStatus } from '@/generated/prisma'
import { fail, ok } from '@/lib/api/response'
import { DomainError } from '@/lib/errors'
import { logAppError } from '@/lib/logs/app-logger'
import prisma from '@/lib/prisma'
import {
  loadDemoFloorWorkers,
  runDemoAddProgressForSingleExecutingOrder
} from '@/lib/simulation/demo-add-progress'

const bodySchema = z.object({
  orderId: z.string().min(1)
})

export async function POST(req: NextRequest) {
  if (process.env.IS_DEMO !== 'true') {
    return fail('Not found.', 'NOT_FOUND', 404)
  }

  const raw = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(raw)
  if (!parsed.success) {
    return fail('orderId is required.', 'VALIDATION_ERROR', 400)
  }

  const orderId = parsed.data.orderId.trim()

  try {
    const po = await prisma.purchaseOrder.findFirst({
      where: {
        id: orderId,
        status: OrderStatus.EXECUTING,
        deletedAt: null
      },
      select: { id: true, reference: true, warehouseId: true }
    })

    if (!po) {
      return fail('Purchase order not found or not EXECUTING.', 'NOT_FOUND', 404)
    }

    const workers = await loadDemoFloorWorkers(prisma)
    if (workers.length === 0) {
      const row = {
        purchaseOrderId: po.id,
        reference: po.reference,
        ok: false,
        message: 'No eligible warehouse workers found for demo.'
      }

      return ok(row, 'Batch step skipped.')
    }

    const row = await runDemoAddProgressForSingleExecutingOrder(prisma, po, workers)

    return ok(row, row.ok ? 'Progress applied.' : 'Progress step finished with issues.')
  } catch (error) {
    if (error instanceof DomainError) {
      return fail(error.message, error.code, error.status)
    }

    logAppError('[POST /api/simulation/add-progress/order]', error)

    return fail('Failed to apply progress for purchase order.')
  }
}
