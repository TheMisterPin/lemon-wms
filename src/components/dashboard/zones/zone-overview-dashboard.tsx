'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/zones/zone-overview-dashboard.md
 */


import Link from 'next/link'

import { WarehouseOverviewStatusPill } from '@/components/primitives/warehouse-overview-primitives'
import type { WarehouseActivityRow } from '@/components/dashboard/warehouses/components/warehouse-overview-types'
import type { WarehouseStockCategoryRow } from '@/components/dashboard/warehouses/components/warehouse-overview-types'
import { WarehouseActivitySummary } from '@/components/dashboard/warehouses/components/WarehouseActivitySummary'
import { WarehouseStockSummary } from '@/components/dashboard/warehouses/components/WarehouseStockSummary'

import { ZoneBinsSection } from '@/components/dashboard/zones/components/zone-bins-section'
import { ZoneFillDistributionBarChart } from '@/components/dashboard/zones/components/ZoneFillDistributionBarChart'
import { ZoneOverviewKpiStrip } from '@/components/dashboard/zones/components/ZoneOverviewKpiStrip'
import type { ZoneOverviewDashboardData } from '@/types/zone-overview-dashboard.types'

function zoneStatusPillTone(
  zone: ZoneOverviewDashboardData['zone']
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (!zone.isActive) {
    return 'neutral'
  }

  return 'success'
}

function zoneStatusLabel(zone: ZoneOverviewDashboardData['zone']): string {
  return zone.isActive ? 'Active' : 'Inactive'
}

type DashboardZoneOverviewViewProps = {
  data: ZoneOverviewDashboardData
}

function toWarehouseStockCategories(
  rows: ZoneOverviewDashboardData['categoryMix']
): WarehouseStockCategoryRow[] {
  return rows.map((r) => ({
    label: r.label,
    totalOnHand: r.totalOnHand,
    available: r.available,
    reserved: r.reserved,
    blocked: r.blocked,
    color: r.color
  }))
}

function toWarehouseActivityRows(rows: ZoneOverviewDashboardData['activity']): WarehouseActivityRow[] {
  return rows.map((r) => ({
    id: r.id,
    time: r.time,
    user: r.user,
    action: r.action,
    entity: r.entity,
    status: r.status
  }))
}

/** Zone command center: bins, capacity, stock mix, bin cards, UAE scoped to bins. */
export function DashboardZoneOverviewView({ data }: DashboardZoneOverviewViewProps) {
  const categoriesForChart = toWarehouseStockCategories(data.categoryMix)
  const activityRows = toWarehouseActivityRows(data.activity)

  return (
    <main
      className="min-h-screen p-4 xl:p-6"
      style={{
        background: 'var(--wh-page-bg, #0d1117)',
        color: 'var(--wh-text-primary, #f8fafc)'
      }}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
              <Link href="/dashboard/locations/warehouses" className="hover:underline">
                Warehouses
              </Link>
              <span className="mx-2">/</span>
              <Link
                href={`/dashboard/locations/warehouses/${data.zone.warehouseId}`}
                className="hover:underline"
              >
                {data.zone.warehouseName}
              </Link>
              <span className="mx-2">/</span>
              <span>{data.zone.name}</span>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{data.zone.name}</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--wh-text-muted, #94a3b8)' }}>
              {data.headerSubtitle}
            </p>
            <p className="mt-1 text-xs font-mono" style={{ color: 'var(--wh-text-secondary)' }}>
              {data.zone.type}
            </p>
          </div>
          <WarehouseOverviewStatusPill tone={zoneStatusPillTone(data.zone)}>
            {zoneStatusLabel(data.zone)}
          </WarehouseOverviewStatusPill>
        </div>

        <ZoneOverviewKpiStrip metrics={data.metrics} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ZoneFillDistributionBarChart rows={data.fillDistribution} />
          <WarehouseStockSummary categories={categoriesForChart} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <ZoneBinsSection bins={data.bins} />
          <WarehouseActivitySummary activity={activityRows} title="Recent zone activity" />
        </div>
      </div>
    </main>
  )
}
