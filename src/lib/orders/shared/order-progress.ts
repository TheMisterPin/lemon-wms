import { toQty } from './pick-line-progress'

export type ReceiptQuantitiesLine = {
  orderedQuantity: { toNumber(): number }
  receiptLines: Array<{ quantity: { toNumber(): number } }>
}

/**
 * Progress percent for a purchase order derived from master lines:
 * a line is "done" when sum(receipt line quantities) >= ordered quantity.
 * Matches order detail aggregation; single source of truth vs header counters.
 */
export function computePurchaseOrderProgressPercentFromMasterLines(
  lines: ReceiptQuantitiesLine[]
): number {
  if (lines.length === 0) {
    return 0
  }

  const done = lines.filter((line) => {
    const executed = line.receiptLines.reduce((s, r) => s + toQty(r.quantity), 0)

    return executed >= toQty(line.orderedQuantity)
  }).length

  return Math.round((done / lines.length) * 100)
}

/**
 * Lines shape used by pick-based order summaries (same as pick-line-progress input).
 */
export type PickMasterLineProgress = {
  baseQuantity: { toNumber(): number }
  pickLines: Array<{ quantity: { toNumber(): number } }>
}
