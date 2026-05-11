'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/stock/dashboard-stock-page.md
 */

import { useMemo } from 'react'

import { DashboardStockPageSkeleton } from '@/components/features/stock/skeletons/dashboard-stock-page-skeleton'
import {
  DashboardDonutBreakdown,
  DashboardItemTotalsCard,
  DashboardKpiCard,
  DashboardKpiGrid,
  DashboardPageShell,
  DashboardSection,
  DashboardStatusBreakdown,
  DashboardChartPanel
} from '@/components/primitives/dashboard'
import { useDashboardStock } from '@/hooks/dashboard/stock/use-dashboard-stock'
import type { StockDashboardCategoryRow } from '@/types/stock-dashboard.types'

const chartColors = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#ec4899', '#06b6d4', '#8b5cf6']

type CategoryChartDatum = StockDashboardCategoryRow & {
  color: string
}

function categoryHref(categoryKey: string): string {
  if (categoryKey === '__none__') {
    return '/dashboard/stock/categories'
  }

  return `/dashboard/stock/categories/${encodeURIComponent(categoryKey)}`
}

export function DashboardStockPage() {
  const { isLoading, error, refetch, data } = useDashboardStock()

  const categoriesForCharts = useMemo((): CategoryChartDatum[] => {
    if (!data) {
      return []
    }

    return data.categories.map((c, i) => ({
      ...c,
      color: chartColors[i % chartColors.length]
    }))
  }, [data])

  const totalOnHandReported = data?.totalOnHand ?? 0

  const subcategoryPanels = useMemo(() => {
    if (!data) {
      return []
    }

    return data.subcategoryGroups.filter((g) => g.rows.length > 0)
  }, [data])

  if (isLoading && !data) {
    return <DashboardStockPageSkeleton />
  }

  if (error !== null || data === null) {
    return (
      <DashboardPageShell
        error={error ?? 'Could not load stock dashboard.'}
        onRetry={() => refetch()}
      />
    )
  }

  const subtitle =
    data.warehouseId !== null && data.warehouseId !== ''
      ? 'Warehouse-scoped stock rollups'
      : 'Network-wide aggregates across all warehouses'

  return (
    <DashboardPageShell
      title="Stock overview"
      subtitle={
        <>
          {subtitle} ·{' '}
          <span style={{ color: 'var(--wh-text-secondary)' }}>
            {data.distinctSkus.toLocaleString()} SKUs · {data.occupiedBins.toLocaleString()} occupied bins ·{' '}
            {data.totalAvailable.toLocaleString()} avail · {data.totalReserved.toLocaleString()} reserved ·{' '}
            {data.totalBlocked.toLocaleString()} blocked
          </span>
        </>
      }
      isLoading={isLoading}
      className="flex flex-col gap-8 xl:gap-10"
    >
      {categoriesForCharts.length === 0 ? (
        <DashboardSection title="Categories">
          <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            No category stock balances found for this scope.
          </p>
        </DashboardSection>
      ) : (
        <>
          <DashboardKpiGrid>
            <DashboardItemTotalsCard
              totalOnHand={data.totalOnHand}
              totalAvailable={data.totalAvailable}
              totalReserved={data.totalReserved}
              totalBlocked={data.totalBlocked}
            />
            {categoriesForCharts.map((d) => (
              <DashboardKpiCard
                key={d.key}
                href={categoryHref(d.key)}
                label={d.label}
                value={d.totalOnHand.toLocaleString()}
                description="Total on hand"
                metrics={[
                  { label: 'avail', value: d.totalAvailable.toLocaleString(), tone: 'available' },
                  { label: 'res', value: d.totalReserved.toLocaleString(), tone: 'reserved' },
                  { label: 'blk', value: d.totalBlocked.toLocaleString(), tone: 'blocked' }
                ]}
              />
            ))}
          </DashboardKpiGrid>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
            <DashboardSection
              title="On-hand by category"
              action={`${totalOnHandReported.toLocaleString()} units total`}
            >
              <DashboardDonutBreakdown
                rows={categoriesForCharts.map((d) => ({
                  id: d.key,
                  label: d.label,
                  value: d.totalOnHand,
                  color: d.color
                }))}
                total={totalOnHandReported}
              />
            </DashboardSection>

            <DashboardSection title="Stock breakdown" action="By status">
              <DashboardStatusBreakdown
                rows={categoriesForCharts.map((d) => ({
                  id: d.key,
                  label: d.label,
                  available: d.totalAvailable,
                  reserved: d.totalReserved,
                  blocked: d.totalBlocked
                }))}
              />
            </DashboardSection>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
            {subcategoryPanels.map((group) => (
              <DashboardSection
                key={group.parentKey}
                title={group.parentLabel}
                action={`${group.rows.length} subcategories`}
              >
                <DashboardChartPanel>
                  <div
                    className="mb-2 grid grid-cols-5 gap-1 text-[11px] font-medium"
                    style={{ color: 'var(--wh-text-muted)' }}
                  >
                    <span>Sub category</span>
                    <span>On hand</span>
                    <span>Available</span>
                    <span>Reserved</span>
                    <span>Blocked</span>
                  </div>
                  <div className="space-y-1.5 text-sm" style={{ color: 'var(--wh-text-primary)' }}>
                    {group.rows.map((row, rowIdx) => (
                      <div key={`${group.parentKey}-${rowIdx}-${row.name}`} className="grid grid-cols-5 gap-1">
                        <span className="min-w-0 truncate">{row.name}</span>
                        <span className="tabular-nums">{row.onHand.toLocaleString()}</span>
                        <span className="tabular-nums" style={{ color: 'var(--wh-status-available)' }}>
                          {row.available.toLocaleString()}
                        </span>
                        <span className="tabular-nums" style={{ color: 'var(--wh-status-full)' }}>
                          {row.reserved.toLocaleString()}
                        </span>
                        <span className="tabular-nums" style={{ color: 'var(--wh-status-blocked)' }}>
                          {row.blocked.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </DashboardChartPanel>
              </DashboardSection>
            ))}
          </div>
        </>
      )}
    </DashboardPageShell>
  )
}
