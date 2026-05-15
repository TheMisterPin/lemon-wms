import type { PrismaClient } from '@/generated/prisma'

import { startPurchaseOrder } from '@/lib/orders/purchase'
import { ActiveOrderConflictDomainError } from '@/lib/orders/shared/active-order-conflict-error'
import { startSalesOrder } from '@/lib/orders/shared/transition-sales-order'
import { startTransferOrder } from '@/lib/orders/shared/transition-transfer-order'
import type { WarehouseOperationalOrderKind } from '@/lib/orders/shared/warehouse-operational-route-kind'
import {
  listUserExecutingOperationalOrderRefs,
  operationalOrderReferences,
  pauseAllUserExecutingOperationalOrders
} from '@/lib/orders/shared/warehouse-user-executing-operational-orders'

export type StartedOperationalOrder =
  | Awaited<ReturnType<typeof startPurchaseOrder>>
  | Awaited<ReturnType<typeof startSalesOrder>>
  | Awaited<ReturnType<typeof startTransferOrder>>

export async function startOperationalOrderForFloorUser(
  prisma: PrismaClient,
  params: {
    kind: WarehouseOperationalOrderKind
    orderId: string
    warehouseId: string
    userId: string
    zoneId: string | null | undefined
    forcePauseOthers?: boolean
  }
): Promise<StartedOperationalOrder> {
  const executing = await listUserExecutingOperationalOrderRefs(
    prisma,
    params.userId,
    params.warehouseId
  )

  if (executing.length > 0 && !params.forcePauseOthers) {
    const withRefs = await operationalOrderReferences(prisma, executing)

    throw new ActiveOrderConflictDomainError(withRefs)
  }

  if (executing.length > 0 && params.forcePauseOthers) {
    await pauseAllUserExecutingOperationalOrders(prisma, params.userId, params.warehouseId)
  }

  const zoneId = params.zoneId ?? null

  if (params.kind === 'purchase') {
    return startPurchaseOrder(prisma, params.orderId, params.warehouseId, params.userId, zoneId)
  }
  if (params.kind === 'sales') {
    return startSalesOrder(prisma, params.orderId, params.warehouseId, params.userId, zoneId)
  }

  return startTransferOrder(prisma, params.orderId, params.warehouseId, params.userId, zoneId)
}
