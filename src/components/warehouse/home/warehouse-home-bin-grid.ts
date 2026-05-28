import type { BinRecord } from '@/components/features/locations/warehouses/components/dashboard-types'
import type { WarehouseBinRecord } from '@/components/warehouse/orders/types'

function fillPercent(bin: WarehouseBinRecord): number {
  if (typeof bin.filledPercentage === 'number' && Number.isFinite(bin.filledPercentage)) {
    return Math.min(100, Math.max(0, Math.round(bin.filledPercentage)))
  }

  const current = bin.currentCapacity ?? 0
  const max = bin.maxCapacity ?? 0

  if (max <= 0) {
    return 0
  }

  return Math.min(100, Math.max(0, Math.round((current / max) * 100)))
}

export function toWarehouseHomeBinGridRecords(bins: WarehouseBinRecord[]): BinRecord[] {
  return bins.map((bin) => ({
    id: bin.id,
    name: bin.name,
    type: bin.type,
    itemsInBin: bin.itemsInBin,
    filledPercentage: fillPercent(bin),
    active: true,
    isBlocked: 'isBlocked' in bin && bin.isBlocked === true
  }))
}
