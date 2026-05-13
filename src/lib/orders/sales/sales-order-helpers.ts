import { ReceiptOutcome } from '@/generated/prisma'

import {
  isExecutionQuantitySatisfied,
  isMasterLineFullyServed,
  isPurchaseReceiptLineDispositionComplete
} from '@/lib/orders/purchase/receipt/receipt-order-helpers'

export {
  isExecutionQuantitySatisfied,
  isMasterLineFullyServed,
  isPurchaseReceiptLineDispositionComplete
}

export function isSalesPickLineDispositionComplete(
  disposition: ReceiptOutcome,
  handledQty: number,
  orderedQty: number
): boolean {
  if (!isMasterLineFullyServed({ toNumber: () => orderedQty }, handledQty)) {
    return false
  }

  return disposition === ReceiptOutcome.ACCEPTED
}
