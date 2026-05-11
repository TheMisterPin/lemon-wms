'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/dashboard-warehouse-overview.md
 */

import type { ComponentType } from 'react'

import {
  WarehouseOverviewButton,
  WarehouseOverviewStatusPill,
  warehouseOverviewToneStyles
} from '@/components/primitives/warehouse-overview-primitives'
import type { WarehouseOverviewTone } from '@/components/primitives/warehouse-overview-primitives'
import type { WarehouseOverviewDashboardData, WarehouseOverviewDashboardKpiRow } from '@/types/warehouse-overview-dashboard.types'
import { WarehouseActivitySummary } from '../components/warehouse-activity-summary'
import { WarehouseOrderWorkload } from '../components/warehouse-order-workload'
import { warehouseOverviewIcons } from '../components/warehouse-overview-icons'
import { WarehouseStockSummary } from '../components/warehouse-stock-summary'
import { WarehouseZoneSummary } from '../components/warehouse-zone-summary'
import type { WarehouseOverviewIconProps } from '../components/warehouse-overview-icons'

type KpiRenderable = WarehouseOverviewDashboardKpiRow & {
  icon: ComponentType<WarehouseOverviewIconProps>
}

const WAREHOUSE_OVERVIEW_KPI_ICONS: Record<string, ComponentType<WarehouseOverviewIconProps>> = {
  Devices: warehouseOverviewIcons.devices,
  Users: warehouseOverviewIcons.users,
  Orders: warehouseOverviewIcons.orders,
  'Stock on hand': warehouseOverviewIcons.stock,
  Exceptions: warehouseOverviewIcons.exceptions,
  'Warehouse fill': warehouseOverviewIcons.warehouse
}

function mergeWarehouseOverviewKpis(rows: WarehouseOverviewDashboardKpiRow[]): KpiRenderable[] {
  return rows.map((row) => ({
    ...row,
    icon: WAREHOUSE_OVERVIEW_KPI_ICONS[row.label] ?? warehouseOverviewIcons.orders
  }))
}

function parseWarehouseFillPercent(value: string): number {
  const n = parseInt(value.replace(/%/g, ''), 10)

  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0
}

function WarehouseOverviewKpiCard({
  item,
  showProgress = false,
  progress = 0,
  href
}: {
  item: KpiRenderable
  showProgress?: boolean
  progress?: number
  href?: string | null
}) {
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
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {showProgress ? (
            <div className="flex items-start gap-3">
              <div className="shrink-0 text-3xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary, #f8fafc)' }}>
                {progress}%
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="text-sm font-medium" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
                  {item.label}
                </div>
                <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-card-bg-soft, #171c24)' }}>
                  <div style={{ width: `${progress}%`, background: tone.icon }} />
                </div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
                  {item.helper}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
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
          )}
        </div>
        {href ? (
          <a href={href} className="shrink-0 opacity-0 transition group-hover:opacity-100">
            <WarehouseOverviewButton variant="secondary" size="sm">
              See more
            </WarehouseOverviewButton>
          </a>
        ) : null}
      </div>
    </div>
  )
}

type DashboardWarehouseOverviewViewProps = {
  data: WarehouseOverviewDashboardData
  /** `embedded` skips outer `<main>` for use inside the locations dashboard shell. */
  variant?: 'page' | 'embedded'
}

/** Live warehouse overview (KPI strip, workload, stock donut, zones, activity). */
export function DashboardWarehouseOverviewView({
  data,
  variant = 'embedded'
}: DashboardWarehouseOverviewViewProps) {
  const kpis = mergeWarehouseOverviewKpis(data.kpis)
  const fillKpi = kpis.find((k) => k.label === 'Warehouse fill')
  const fillPct = fillKpi ? parseWarehouseFillPercent(fillKpi.value) : 0

  const shellClass =
    variant === 'page'
      ? 'min-h-screen p-4 xl:p-6'
      : 'space-y-5'

  const inner = (
    <div className={variant === 'page' ? 'mx-auto max-w-7xl space-y-5' : 'space-y-5'}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
            Locations / Warehouse / {data.warehouse.code}
          </div>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{data.warehouse.name}</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
            Warehouse command center for stock, orders, users, devices, and exceptions.
          </p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <WarehouseOverviewStatusPill tone="success">ACTIVE</WarehouseOverviewStatusPill>
          <WarehouseOverviewStatusPill>
            Last activity{' '}
            {data.warehouse.lastActivityRelative ?? '—'}
          </WarehouseOverviewStatusPill>
          <WarehouseOverviewButton variant="secondary">View stock</WarehouseOverviewButton>
          <WarehouseOverviewButton>View orders</WarehouseOverviewButton>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((item) => (
          <WarehouseOverviewKpiCard
            key={item.label}
            item={item}
            showProgress={item.label === 'Warehouse fill'}
            progress={item.label === 'Warehouse fill' ? fillPct : 0}
            href={
              item.label === 'Stock on hand'
                ? `/dashboard/locations/warehouses/${data.warehouse.id}/stock`
                : null
            }
          />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <WarehouseOrderWorkload orderTypes={data.orderTypes} />
        <WarehouseStockSummary categories={data.stockCategories} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <WarehouseZoneSummary zones={data.zones} />
        <WarehouseActivitySummary activity={data.activity} />
      </div>
    </div>
  )

  if (variant === 'page') {
    return (
      <main
        className={shellClass}
        style={{ background: 'var(--wh-page-bg, #0d1117)', color: 'var(--wh-text-primary, #f8fafc)' }}
      >
        {inner}
      </main>
    )
  }

  return (
    <div className={shellClass} style={{ color: 'var(--wh-text-primary, #f8fafc)' }}>
      {inner}
    </div>
  )
}
