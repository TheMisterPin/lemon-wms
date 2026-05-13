import { Prisma, ReceiptOutcome } from '@/generated/prisma'

import { toQty } from '@/lib/orders/shared/pick-line-progress'

type Tx = Prisma.TransactionClient

type ReceiptLineQty = {
  quantity: Prisma.Decimal
  disposition: ReceiptOutcome
}

function buildReceiptRollupDecimals(lines: ReceiptLineQty[]): {
  totalProcessedQuantity: Prisma.Decimal
  totalAcceptedQuantity: Prisma.Decimal
  totalRejectedQuantity: Prisma.Decimal
  totalQuarantinedQty: Prisma.Decimal
} {
  let totalProcessedQuantity = new Prisma.Decimal(0)
  let totalAcceptedQuantity = new Prisma.Decimal(0)
  let totalRejectedQuantity = new Prisma.Decimal(0)
  let totalQuarantinedQty = new Prisma.Decimal(0)

  for (const line of lines) {
    totalProcessedQuantity = totalProcessedQuantity.add(line.quantity)

    if (line.disposition === ReceiptOutcome.ACCEPTED) {
      totalAcceptedQuantity = totalAcceptedQuantity.add(line.quantity)
    } else if (line.disposition === ReceiptOutcome.QUARANTINED) {
      totalQuarantinedQty = totalQuarantinedQty.add(line.quantity)
    } else if (line.disposition === ReceiptOutcome.REJECTED) {
      totalRejectedQuantity = totalRejectedQuantity.add(line.quantity)
    } else {
      totalRejectedQuantity = totalRejectedQuantity.add(line.quantity)
    }
  }

  return {
    totalProcessedQuantity,
    totalAcceptedQuantity,
    totalRejectedQuantity,
    totalQuarantinedQty
  }
}

export async function recomputePurchaseOrderReceiptRollups(tx: Tx, purchaseOrderReceiptId: string): Promise<void> {
  const lines = await tx.purchaseOrderReceiptLine.findMany({
    where: { purchaseOrderReceiptId },
    select: { quantity: true, disposition: true }
  })

  const rollup = buildReceiptRollupDecimals(lines)

  await tx.purchaseOrderReceipt.update({
    where: { id: purchaseOrderReceiptId },
    data: rollup
  })
}

type PickLineRollupRow = {
  quantity: Prisma.Decimal
  orderedQuantity: Prisma.Decimal
  disposition: ReceiptOutcome
  correctionOfLineId: string | null
}

function buildPickRollupUpdate(
  lines: PickLineRollupRow[]
): {
  totalPickedQuantity: Prisma.Decimal
  totalShortQuantity: Prisma.Decimal
  completedLines: number
  openLines: number
  totalLines: number
} {
  const primaries = lines.filter((line) => line.correctionOfLineId === null)
  const totalLines = primaries.length
  let totalPicked = 0
  let totalShort = 0
  let completedLines = 0

  for (const line of primaries) {
    const q = toQty(line.quantity)
    const o = toQty(line.orderedQuantity)

    if (line.disposition === ReceiptOutcome.ACCEPTED) {
      totalPicked += q
    }

    if (q < o) {
      totalShort += o - q
    }

    if (q >= o) {
      completedLines += 1
    }
  }

  return {
    totalPickedQuantity: new Prisma.Decimal(totalPicked),
    totalShortQuantity: new Prisma.Decimal(totalShort),
    completedLines,
    openLines: Math.max(0, totalLines - completedLines),
    totalLines
  }
}

async function recomputePickDocument(
  tx: Tx,
  loadLines: () => Promise<PickLineRollupRow[]>,
  updatePick: (data: ReturnType<typeof buildPickRollupUpdate>) => Promise<unknown>
): Promise<void> {
  const lines = await loadLines()
  const data = buildPickRollupUpdate(lines)
  await updatePick(data)
}

export async function recomputeSalesOrderPickRollups(tx: Tx, salesOrderPickId: string): Promise<void> {
  await recomputePickDocument(
    tx,
    () =>
      tx.salesOrderPickLine.findMany({
        where: { salesOrderPickId },
        select: {
          quantity: true,
          orderedQuantity: true,
          disposition: true,
          correctionOfLineId: true
        }
      }),
    (data) =>
      tx.salesOrderPick.update({
        where: { id: salesOrderPickId },
        data
      })
  )
}

export async function recomputeTransferOrderPickRollups(tx: Tx, transferOrderPickId: string): Promise<void> {
  await recomputePickDocument(
    tx,
    () =>
      tx.transferOrderPickLine.findMany({
        where: { transferOrderPickId },
        select: {
          quantity: true,
          orderedQuantity: true,
          disposition: true,
          correctionOfLineId: true
        }
      }),
    (data) =>
      tx.transferOrderPick.update({
        where: { id: transferOrderPickId },
        data
      })
  )
}

export async function recomputeReturnOrderPickRollups(tx: Tx, returnOrderPickId: string): Promise<void> {
  await recomputePickDocument(
    tx,
    () =>
      tx.returnOrderPickLine.findMany({
        where: { returnOrderPickId },
        select: {
          quantity: true,
          orderedQuantity: true,
          disposition: true,
          correctionOfLineId: true
        }
      }),
    (data) =>
      tx.returnOrderPick.update({
        where: { id: returnOrderPickId },
        data
      })
  )
}

export async function recomputeAdjustmentOrderPickRollups(
  tx: Tx,
  adjustmentOrderPickId: string
): Promise<void> {
  await recomputePickDocument(
    tx,
    () =>
      tx.adjustmentOrderPickLine.findMany({
        where: { adjustmentOrderPickId },
        select: {
          quantity: true,
          orderedQuantity: true,
          disposition: true,
          correctionOfLineId: true
        }
      }),
    (data) =>
      tx.adjustmentOrderPick.update({
        where: { id: adjustmentOrderPickId },
        data
      })
  )
}
