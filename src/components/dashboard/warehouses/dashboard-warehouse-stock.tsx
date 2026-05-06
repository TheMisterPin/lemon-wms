'use client'

import type { ComponentType } from 'react'
import Link from 'next/link'

import type { WarehouseOverviewIconProps } from '@/components/dashboard/warehouses/components/warehouse-overview-icons'
import { warehouseOverviewIcons } from '@/components/dashboard/warehouses/components/warehouse-overview-icons'
import {
  warehouseOverviewToneStyles
} from '@/components/dashboard/warehouses/components/warehouse-overview-primitives'
import type { WarehouseOverviewTone } from '@/components/dashboard/warehouses/components/warehouse-overview-primitives'
import { WarehouseStockAvailabilityBarChart } from '@/components/dashboard/warehouses/components/WarehouseStockAvailabilityBarChart'
import { WarehouseStockItemsTable } from '@/components/dashboard/warehouses/components/WarehouseStockItemsTable'
import { WarehouseStockSummary } from '@/components/dashboard/warehouses/components/WarehouseStockSummary'
import { WarehouseStockZonesTable } from '@/components/dashboard/warehouses/components/WarehouseStockZonesTable'
import type { WarehouseStockDashboardData } from '@/types/warehouse-stock-dashboard.types'

type StockKpiRenderable = WarehouseStockDashboardData['kpis'][number] & {
  icon: ComponentType<WarehouseOverviewIconProps>
}

const STOCK_KPI_ICONS: Record<string, ComponentType<WarehouseOverviewIconProps>> = {
  'Total On Hand': warehouseOverviewIcons.stock,
  Available: warehouseOverviewIcons.check,
  Reserved: warehouseOverviewIcons.assigned,
  Blocked: warehouseOverviewIcons.exceptions,
  'Occupied Bins': warehouseOverviewIcons.warehouse,
  'Empty Bins': warehouseOverviewIcons.search,
  'Stock in Quarantine Zones': warehouseOverviewIcons.exceptions,
  'Expiring Soon': warehouseOverviewIcons.clock
}

function mergeStockKpis(rows: WarehouseStockDashboardData['kpis']): StockKpiRenderable[] {
  return rows.map((row) => ({
    ...row,
    icon: STOCK_KPI_ICONS[row.label] ?? warehouseOverviewIcons.stock
  }))
}

function WarehouseStockKpiCard({ item }: { item: StockKpiRenderable }) {
  const Icon = item.icon
  const tone = warehouseOverviewToneStyles[item.tone as WarehouseOverviewTone]

  return (
    <div
      className="group rounded-lg border p-4 transition hover:border-opacity-100"
      style={{
        background: 'var(--wh-card-bg)',
        borderColor: 'var(--wh-border)'
      }}
    >
      <div className="flex flex-1 gap-3">
        <div style={{ color: tone.icon }} className="shrink-0">
          <Icon />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
            {item.label}
          </div>
          <div className="text-xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary, #f8fafc)' }}>
            {item.value}
          </div>
          <div className="text-xs leading-relaxed" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
            {item.helper}
          </div>
        </div>
      </div>
    </div>
  )
}

type DashboardWarehouseStockViewProps = {
  data: WarehouseStockDashboardData
}

/** Warehouse-scoped stock analytics: KPIs, category mix, zones, and top items. */
export function DashboardWarehouseStockView({ data }: DashboardWarehouseStockViewProps) {
  const kpis = mergeStockKpis(data.kpis)
  const categories = data.categoryDistribution

  return (
    <main
      className="min-h-screen p-4 xl:p-6"
      style={{ background: 'var(--wh-page-bg, #0d1117)', color: 'var(--wh-text-primary, #f8fafc)' }}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <div className="text-sm" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
            <Link href="/dashboard/locations/warehouses" className="hover:underline">
              Warehouses
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/dashboard/locations/warehouses/${data.warehouseId}`} className="hover:underline">
              Overview
            </Link>
            <span className="mx-2">/</span>
            <span>Stock</span>
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{data.header.title}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
            {data.header.subtitle}
          </p>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((item) => (
            <WarehouseStockKpiCard key={item.label} item={item} />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <WarehouseStockSummary categories={categories} />
          <WarehouseStockAvailabilityBarChart rows={categories} />
        </div>

        <WarehouseStockZonesTable zones={data.zones} />
        <WarehouseStockItemsTable items={data.items} />
      </div>
    </main>
  )
}
