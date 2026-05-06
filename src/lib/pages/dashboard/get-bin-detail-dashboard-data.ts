import { Prisma } from '@/generated/prisma'
import type { BinOperationType, PrismaClient } from '@/generated/prisma'

import { DomainError } from '@/lib/errors'
import { getBinFillTimelineFromBinHistory } from '@/lib/logs/bin-history/bin-history-queries'
import { getRecentBinActivityForDashboard } from '@/lib/logs/bin-operation-entries/dashboard-queries'
import type { BinDetailDashboardDTO, DashboardKpi } from '@/types/bin-detail-dashboard.types'

function decimalToNum(value: Prisma.Decimal | null | undefined): number {
  if (value === null || value === undefined) {
    return 0
  }

  const n = value.toNumber()

  return Number.isFinite(n) ? n : 0
}

function sumDecimal(
  a: Prisma.Decimal,
  b: Prisma.Decimal | null | undefined
): Prisma.Decimal {
  return a.plus(b ?? new Prisma.Decimal(0))
}

function binCapacityFillPercent(bin: {
  maxCapacity: Prisma.Decimal | null
  currentCapacity: Prisma.Decimal | null
}): number {
  const max = bin.maxCapacity?.toNumber() ?? null
  const cur = bin.currentCapacity?.toNumber() ?? null
  if (max === null || max <= 0 || cur === null) {
    return 0
  }

  return Math.min(100, Math.round((cur / max) * 100))
}

function humanizeBoeType(type: BinOperationType): string {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (ch) => ch.toUpperCase())
}

function formatContentHref(itemId: string): string {
  return `/dashboard/items?focusItemId=${encodeURIComponent(itemId)}`
}

async function getBinDetailDashboardData(
  prisma: PrismaClient,
  binId: string
): Promise<BinDetailDashboardDTO> {
  const bin = await prisma.bin.findFirst({
    where: { id: binId, deletedAt: null },
    select: {
      id: true,
      code: true,
      type: true,
      isBlocked: true,
      maxCapacity: true,
      currentCapacity: true,
      zoneId: true,
      warehouseId: true,
      zone: { select: { id: true, name: true } },
      warehouse: { select: { id: true, name: true } }
    }
  })

  if (!bin) {
    throw new DomainError('Bin not found.', 'NOT_FOUND', 404)
  }

  const stockRows = await prisma.binStockItem.findMany({
    where: { binId: bin.id },
    select: {
      id: true,
      itemId: true,
      sku: true,
      name: true,
      uom: true,
      quantityAvailable: true,
      quantityReserved: true,
      quantityBlocked: true,
      status: true,
      lastOperationBoeId: true,
      lot: { select: { lotNumber: true } },
      serialNumber: { select: { serial: true } }
    },
    orderBy: [{ sku: 'asc' }, { id: 'asc' }]
  })

  const lastBoeIds = [...new Set(stockRows.map((r) => r.lastOperationBoeId).filter((x): x is string => x !== null && x !== ''))]

  const lastBoes =
    lastBoeIds.length === 0
      ? []
      : await prisma.binOperationEntry.findMany({
        where: { id: { in: lastBoeIds } },
        select: { id: true, type: true }
      })

  const typeByBoeId = new Map(lastBoes.map((b) => [b.id, b.type]))

  let totalAvailable = new Prisma.Decimal(0)
  let totalReserved = new Prisma.Decimal(0)
  let totalBlocked = new Prisma.Decimal(0)
  const itemIdSet = new Set<string>()

  for (const row of stockRows) {
    itemIdSet.add(row.itemId)
    totalAvailable = sumDecimal(totalAvailable, row.quantityAvailable)
    totalReserved = sumDecimal(totalReserved, row.quantityReserved)
    totalBlocked = sumDecimal(totalBlocked, row.quantityBlocked)
  }

  const availN = decimalToNum(totalAvailable)
  const resN = decimalToNum(totalReserved)
  const blkN = decimalToNum(totalBlocked)
  const onHandUnits = availN + resN + blkN

  const maxCapN = bin.maxCapacity?.toNumber() ?? null
  const currentCapN = bin.currentCapacity?.toNumber() ?? null

  const fillPct = binCapacityFillPercent(bin)

  const fillTone: DashboardKpi['tone'] = fillPct >= 90 ? 'warning' : fillPct >= 70 ? 'success' : 'neutral'

  const kpis: DashboardKpi[] = [
    {
      label: 'Current fill',
      value:
        maxCapN !== null && maxCapN > 0
          ? `${fillPct}%`
          : '—',
      helper:
        maxCapN !== null && maxCapN > 0 && currentCapN !== null
          ? `${currentCapN.toLocaleString()} / ${maxCapN.toLocaleString()} capacity units`
          : 'No capacity limit recorded for this bin',
      tone: fillTone
    },
    {
      label: 'Units on hand',
      value: onHandUnits.toLocaleString(),
      helper: `${stockRows.length.toLocaleString()} lines · ${itemIdSet.size.toLocaleString()} unique SKUs`,
      tone: 'neutral'
    },
    {
      label: 'Availability mix',
      value: `${availN.toLocaleString()} avail`,
      helper: `${resN.toLocaleString()} reserved · ${blkN.toLocaleString()} blocked`,
      tone: 'success'
    }
  ]

  const header: BinDetailDashboardDTO['header'] = {
    title: bin.code,
    subtitle: `${bin.warehouse.name} · ${bin.zone.name}`,
    binId: bin.id,
    binCode: bin.code,
    binType: bin.type,
    zoneId: bin.zone.id,
    zoneName: bin.zone.name,
    warehouseId: bin.warehouse.id,
    warehouseName: bin.warehouse.name,
    isBlocked: bin.isBlocked
  }

  const fillOverTime = await getBinFillTimelineFromBinHistory(prisma, bin.id, maxCapN, {
    currentUnitsHint: onHandUnits
  })

  const activity = await getRecentBinActivityForDashboard(prisma, bin.id)

  const contents: BinDetailDashboardDTO['contents'] = stockRows.map((row): BinDetailDashboardDTO['contents'][0] => {
    const av = decimalToNum(row.quantityAvailable)
    const rv = decimalToNum(row.quantityReserved)
    const bv = decimalToNum(row.quantityBlocked)
    const lastType = row.lastOperationBoeId === null ? null : typeByBoeId.get(row.lastOperationBoeId)
    const lastOperationLabel =
      lastType === undefined || lastType === null ? '—' : humanizeBoeType(lastType)

    return {
      binStockItemId: row.id,
      itemId: row.itemId,
      sku: row.sku,
      name: row.name,
      lotCode: row.lot?.lotNumber ?? undefined,
      serialNumber: row.serialNumber?.serial ?? undefined,
      uom: row.uom,
      available: av,
      reserved: rv,
      blocked: bv,
      status: row.status,
      lastOperationLabel,
      href: formatContentHref(row.itemId)
    }
  })

  return {
    header,
    kpis,
    fillOverTime,
    contents,
    activity
  }
}

export { getBinDetailDashboardData }
