'use client'

import { warehouseOverviewIcons } from '@/components/dashboard/warehouses/components/warehouse-overview-icons'
import { warehouseOverviewToneStyles } from '@/components/dashboard/warehouses/components/warehouse-overview-primitives'
import type { WarehouseOverviewTone } from '@/components/dashboard/warehouses/components/warehouse-overview-primitives'
import type { ZoneOverviewDashboardMetrics } from '@/types/zone-overview-dashboard.types'

function ZoneOverviewBinsKpi({ metrics }: { metrics: ZoneOverviewDashboardMetrics }) {
  const tone = warehouseOverviewToneStyles.neutral
  const Icon = warehouseOverviewIcons.warehouse

  return (
    <div
      className="rounded-lg border p-4 transition hover:border-opacity-100"
      style={{
        background: 'var(--wh-card-bg)',
        borderColor: 'var(--wh-border)'
      }}
    >
      <div className="flex gap-3">
        <div style={{ color: tone.icon }} className="shrink-0">
          <Icon />
        </div>
        <div className="space-y-2 min-w-0 flex-1">
          <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
            Bins in use
          </div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary, #f8fafc)' }}>
            {metrics.binsOccupied.toLocaleString()}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--wh-text-secondary, #cbd5e1)' }}>
            <span>
              Total{' '}
              <span style={{ color: 'var(--wh-text-primary)', fontWeight: 600 }}>
                {metrics.binsTotal.toLocaleString()}
              </span>
            </span>
            <span>
              Blocked{' '}
              <span style={{ color: 'var(--wh-status-blocked, #ef4444)' }}>{metrics.binsBlocked.toLocaleString()}</span>
            </span>
            <span>
              Empty{' '}
              <span style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>{metrics.binsEmpty.toLocaleString()}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ZoneOverviewStockKpi({ metrics }: { metrics: ZoneOverviewDashboardMetrics }) {
  const tone = warehouseOverviewToneStyles.success
  const Icon = warehouseOverviewIcons.stock

  return (
    <div
      className="rounded-lg border p-4 transition hover:border-opacity-100"
      style={{
        background: 'var(--wh-card-bg)',
        borderColor: 'var(--wh-border)'
      }}
    >
      <div className="flex gap-3">
        <div style={{ color: tone.icon }} className="shrink-0">
          <Icon />
        </div>
        <div className="space-y-2 min-w-0 flex-1">
          <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
            Stock in zone
          </div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary, #f8fafc)' }}>
            {metrics.qtyOnHandTotal.toLocaleString()}
          </div>
          <div className="grid grid-cols-3 gap-1 text-xs" style={{ color: 'var(--wh-text-secondary, #cbd5e1)' }}>
            <div>
              <span style={{ color: 'var(--wh-status-available, #22c55e)' }}>{metrics.qtyAvailable}</span> avail
            </div>
            <div>
              <span style={{ color: 'var(--wh-status-full, #eab308)' }}>{metrics.qtyReserved}</span> res
            </div>
            <div>
              <span style={{ color: 'var(--wh-status-blocked, #ef4444)' }}>{metrics.qtyBlocked}</span> blk
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ZoneOverviewFillageKpi({ metrics }: { metrics: ZoneOverviewDashboardMetrics }) {
  const toneKey: WarehouseOverviewTone =
    metrics.fillPercent >= 85 ? 'warning' : metrics.fillPercent >= 65 ? 'success' : 'neutral'
  const tone = warehouseOverviewToneStyles[toneKey]
  const Icon = warehouseOverviewIcons.warehouse

  return (
    <div
      className="rounded-lg border p-4 transition hover:border-opacity-100"
      style={{
        background: 'var(--wh-card-bg)',
        borderColor: 'var(--wh-border)'
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl font-bold tabular-nums shrink-0" style={{ color: 'var(--wh-text-primary, #f8fafc)' }}>
          {metrics.fillPercent}%
        </div>
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div style={{ color: tone.icon }} className="shrink-0">
              <Icon />
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
              Capacity fill (avg.)
            </div>
          </div>
          <div className="flex h-2 overflow-hidden rounded-full" style={{ background: 'var(--wh-card-bg-soft, #171c24)' }}>
            <div style={{ width: `${Math.min(100, metrics.fillPercent)}%`, background: tone.icon }} />
          </div>
        </div>
      </div>
    </div>
  )
}

type ZoneOverviewKpiStripProps = {
  metrics: ZoneOverviewDashboardMetrics
}

export function ZoneOverviewKpiStrip({ metrics }: ZoneOverviewKpiStripProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <ZoneOverviewBinsKpi metrics={metrics} />
      <ZoneOverviewStockKpi metrics={metrics} />
      <ZoneOverviewFillageKpi metrics={metrics} />
    </section>
  )
}
