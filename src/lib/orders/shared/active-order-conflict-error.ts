import { OrderType } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'

import type { OperationalOrderRefWithReference } from '@/lib/orders/shared/warehouse-user-executing-operational-orders'

function formatOrderType(orderType: OrderType): string {
  if (orderType === OrderType.PURCHASE) {
    return 'Purchase'
  }
  if (orderType === OrderType.SALES) {
    return 'Sales'
  }

  return 'Transfer'
}

export class ActiveOrderConflictDomainError extends DomainError {
  readonly conflictingOrders: OperationalOrderRefWithReference[]

  constructor(conflictingOrders: OperationalOrderRefWithReference[]) {
    const first = conflictingOrders[0]
    const message = first
      ? `You are currently assigned to the ${formatOrderType(first.orderType)} order (${first.reference}).`
      : 'Another order is already executing.'

    super(message, 'ACTIVE_ORDER_CONFLICT', 409)
    this.conflictingOrders = conflictingOrders
  }
}
