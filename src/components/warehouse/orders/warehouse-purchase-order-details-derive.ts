import { ReceiptOutcome } from '@/generated/prisma'

import type { WarehousePurchaseOrderReceiptLineApi } from '@/types/api/warehouse-purchase-order-receipt'

/** Outcomes operators can POST on handle for a primary receipt line (CORRECTION is server-driven). */
export const PURCHASE_RECEIPT_DECLARE_OUTCOMES: ReceiptOutcome[] = [
  ReceiptOutcome.ACCEPTED,
  ReceiptOutcome.QUARANTINED,
  ReceiptOutcome.DAMAGED,
  ReceiptOutcome.EXPIRED,
  ReceiptOutcome.REJECTED,
  ReceiptOutcome.QUALITY_ISSUE,
  ReceiptOutcome.OTHER
]

export type ReceiptLineProgress = {
  orderedQty: number
  declaredQty: number
  receivedQty: number
  issueQty: number
  pendingQty: number
  lineUiStatus: 'OPEN' | 'PARTIAL' | 'RECEIVED' | 'EXCEPTION'
}

export function parseReceiptQuantity(raw: string): number {
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export function dispositionCountsAsReceived(disposition: ReceiptOutcome | string): boolean {
  return disposition === ReceiptOutcome.ACCEPTED || disposition === ReceiptOutcome.QUARANTINED
}

export function dispositionCountsAsIssue(disposition: ReceiptOutcome | string): boolean {
  if (dispositionCountsAsReceived(disposition)) {
    return false
  }

  return disposition !== ReceiptOutcome.CORRECTION
}

export function deriveReceiptLineProgress(line: WarehousePurchaseOrderReceiptLineApi): ReceiptLineProgress {
  const orderedQty = parseReceiptQuantity(line.orderedQuantity)
  const declaredQty = parseReceiptQuantity(line.quantity)
  const disp = line.disposition as ReceiptOutcome | string

  const receivedQty = dispositionCountsAsReceived(disp) ? declaredQty : 0
  const issueQty =
    !dispositionCountsAsReceived(disp) && disp !== ReceiptOutcome.CORRECTION ? declaredQty : 0
  const pendingQty = Math.max(orderedQty - receivedQty, 0)

  let lineUiStatus: ReceiptLineProgress['lineUiStatus'] = 'OPEN'
  if (receivedQty >= orderedQty && orderedQty > 0) {
    lineUiStatus = issueQty > 0 ? 'EXCEPTION' : 'RECEIVED'
  } else if (receivedQty > 0 || issueQty > 0) {
    lineUiStatus = issueQty > 0 ? 'EXCEPTION' : 'PARTIAL'
  }

  return {
    orderedQty,
    declaredQty,
    receivedQty,
    issueQty,
    pendingQty,
    lineUiStatus
  }
}

/** True when every primary line has declared at least the ordered quantity (floor-side guard before POST complete). */
export function receiptLinesFullyDeclared(lines: WarehousePurchaseOrderReceiptLineApi[]): boolean {
  if (lines.length === 0) {
    return false
  }

  return lines.every((line) => {
    const ordered = parseReceiptQuantity(line.orderedQuantity)
    const declared = parseReceiptQuantity(line.quantity)

    return declared + 1e-9 >= ordered
  })
}
