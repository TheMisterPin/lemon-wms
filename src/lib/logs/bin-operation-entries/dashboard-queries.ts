import type { BinOperationType, OrderType, PrismaClient } from '@/generated/prisma'

import type { BinActivityRow } from '@/types/bin-detail-dashboard.types'

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value
  }

  if (value && typeof value === 'object' && 'toNumber' in value) {
    return (value as { toNumber: () => number }).toNumber()
  }

  return 0
}

function formatOrderLabel(orderType: OrderType | null, orderId: string | null): string | undefined {
  if (!orderId) {
    return undefined
  }

  const prefix =
    orderType === 'PURCHASE'
      ? 'PO'
      : orderType === 'SALES'
        ? 'SO'
        : orderType === 'TRANSFER'
          ? 'TO'
          : orderType === 'RETURN'
            ? 'RO'
            : orderType === 'ADJUSTMENT'
              ? 'ADJ'
              : 'Order'

  return `${prefix} · ${orderId.slice(0, 8)}`
}

function mapOperationTypeToActivityAction(
  type: BinOperationType,
  binId: string,
  fromBinId: string | null,
  toBinId: string | null
): BinActivityRow['action'] {
  if (type === 'PUTAWAY' || type === 'RETURN_PUTAWAY') {
    return 'PUTAWAY'
  }

  if (type === 'PICK' || type === 'SHIP') {
    return 'PICK'
  }

  if (type === 'BLOCK') {
    return 'BLOCK'
  }

  if (type === 'UNBLOCK') {
    return 'UNBLOCK'
  }

  if (toBinId === binId && fromBinId !== binId) {
    return 'MOVE_IN'
  }

  if (fromBinId === binId && toBinId !== binId) {
    return 'MOVE_OUT'
  }

  return 'MOVE_IN'
}

const DEFAULT_BIN_ACTIVITY_TAKE = 25

async function getRecentBinActivityForDashboard(
  prisma: PrismaClient,
  binId: string,
  take: number = DEFAULT_BIN_ACTIVITY_TAKE
): Promise<BinActivityRow[]> {
  const rows = await prisma.binOperationEntry.findMany({
    where: {
      OR: [{ fromBinId: binId }, { toBinId: binId }]
    },
    take,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      fromBinId: true,
      toBinId: true,
      quantity: true,
      orderId: true,
      orderType: true,
      createdAt: true,
      user: { select: { fullName: true } }
    }
  })

  const touchedBinIds = new Set<string>()
  for (const row of rows) {
    if (row.fromBinId !== null && row.fromBinId !== '') {
      touchedBinIds.add(row.fromBinId)
    }
    if (row.toBinId !== null && row.toBinId !== '') {
      touchedBinIds.add(row.toBinId)
    }
  }

  const binCodes =
    touchedBinIds.size === 0
      ? []
      : await prisma.bin.findMany({
        where: { id: { in: [...touchedBinIds] } },
        select: { id: true, code: true }
      })

  const codeById = new Map(binCodes.map((b) => [b.id, b.code]))

  return rows.map((row): BinActivityRow => {
    const action = mapOperationTypeToActivityAction(row.type, binId, row.fromBinId, row.toBinId)

    const fromBinCode =
      row.fromBinId === null ? undefined : (codeById.get(row.fromBinId) ?? undefined)
    const toBinCode =
      row.toBinId === null ? undefined : (codeById.get(row.toBinId) ?? undefined)

    return {
      id: row.id,
      occurredAt: row.createdAt.toISOString(),
      action,
      userName: row.user.fullName,
      orderLabel: formatOrderLabel(row.orderType, row.orderId),
      quantity: Math.abs(toNumber(row.quantity)),
      fromBinCode,
      toBinCode
    }
  })
}

export { getRecentBinActivityForDashboard }
