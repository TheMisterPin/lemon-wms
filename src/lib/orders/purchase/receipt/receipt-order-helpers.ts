import { ReceiptOutcome } from '@/generated/prisma'

import { toQty } from '@/lib/orders/shared/pick-line-progress'

export function isMasterLineFullyServed(planQty: { toNumber(): number }, executedQty: number): boolean {
  return executedQty >= toQty(planQty)
}

export function isExecutionQuantitySatisfied(
  declaredQty: { toNumber(): number },
  expectedQty: { toNumber(): number },
  opts?: { tolerance?: number }
): boolean {
  const d = toQty(declaredQty)
  const e = toQty(expectedQty)
  const tol = opts?.tolerance ?? 0

  return Math.abs(d - e) <= tol
}

/** UI-oriented: fully served with an accepted disposition (non-accepted outcomes stay actionable). */
export function isPurchaseReceiptLineDispositionComplete(
  disposition: ReceiptOutcome,
  handledQty: number,
  orderedQty: number
): boolean {
  if (!isMasterLineFullyServed({ toNumber: () => orderedQty }, handledQty)) {
    return false
  }

  return disposition === ReceiptOutcome.ACCEPTED
}
