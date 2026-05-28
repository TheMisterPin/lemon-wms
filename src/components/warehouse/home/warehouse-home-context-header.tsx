'use client'

import type { WarehouseInfo, WarehouseHomeUser } from '@/components/warehouse/orders/types'

import { WarehouseHomeZoneSwitch } from './warehouse-home-zone-switch'

type WarehouseHomeContextHeaderProps = {
  user: WarehouseHomeUser | null
  warehouseInfo: WarehouseInfo | null
}

export function WarehouseHomeContextHeader({
  user,
  warehouseInfo
}: WarehouseHomeContextHeaderProps) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1">
        <p
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: 'var(--wh-text-muted)' }}
        >
          Signed in
        </p>
        <h1
          className="truncate text-2xl font-bold tracking-tight sm:text-3xl"
          style={{ color: 'var(--wh-text-primary)' }}
        >
          {user?.name ?? 'Operator'}
        </h1>
        <p className="text-sm" style={{ color: 'var(--wh-text-secondary)' }}>
          {warehouseInfo?.warehouseName ?? 'Warehouse unavailable'}
        </p>
        <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
          {warehouseInfo?.zoneName ?? 'Zone unavailable'}
        </p>
      </div>
      <WarehouseHomeZoneSwitch />
    </header>
  )
}
