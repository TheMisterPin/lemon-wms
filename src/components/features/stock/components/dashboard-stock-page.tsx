'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/stock/dashboard-stock-page.md
 */

import { useMemo } from 'react'
import { Layers } from 'lucide-react'

import { DashboardStockPageSkeleton } from '@/components/features/stock/skeletons/dashboard-stock-page-skeleton'
import {
  DashboardDonutBreakdown,
  DashboardKpiCard,
  DashboardKpiGrid,
  DashboardPageShell,
  DashboardSection,
  DashboardStatusBreakdown,
  DashboardChartPanel
} from '@/components/primitives/dashboard'
import { CategoryPickerIcon } from '@/components/primitives/media/category-icon'
import { Card, CardContent } from '@/components/ui/card'
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

  const multiSubParentKeys = useMemo(() => {
    if (!data) {
      return new Set<string>()
    }

    return new Set(
      data.subcategoryGroups.filter((g) => g.rows.length > 1).map((g) => g.parentKey)
    )
  }, [data])

  const categoriesForCharts = useMemo((): CategoryChartDatum[] => {
    if (!data) {
      return []
    }

    return data.categories
      .filter((c) => multiSubParentKeys.has(c.key))
      .map((c, i) => ({
        ...c,
        color: chartColors[i % chartColors.length]
      }))
  }, [data, multiSubParentKeys])

  const totalOnHandReported = useMemo(
    () => categoriesForCharts.reduce((sum, c) => sum + c.totalOnHand, 0),
    [categoriesForCharts]
  )

  const subcategoryPanels = useMemo(() => {
    if (!data) {
      return []
    }

    return data.subcategoryGroups.filter((g) => g.rows.length > 1)
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

  const subtitleDetail = (
    <span style={{ color: 'var(--wh-text-secondary)' }}>
      {data.totalAvailable.toLocaleString()} avail · {data.totalReserved.toLocaleString()} reserved ·{' '}
      {data.totalBlocked.toLocaleString()} blocked
    </span>
  )

  return (
    <DashboardPageShell
      title="Stock overview"
      subtitle={
        <>
          {subtitle} · {subtitleDetail}
        </>
      }
      isLoading={isLoading}
      className="flex flex-col gap-8 xl:gap-10"
    >
      <DashboardSection title="Inventory snapshot">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card
            className="border"
            style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
          >
            <CardContent className="p-5">
              <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Total on hand
              </div>
              <div className="mt-1 text-3xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
                {data.totalOnHand.toLocaleString()}
              </div>
              <p className="mt-3 flex flex-wrap justify-between gap-2 text-xs">
                <span style={{ color: 'var(--wh-status-available)' }}>
                  {data.totalAvailable.toLocaleString()} avail
                </span>
                <span style={{ color: 'var(--wh-status-full)' }}>{data.totalReserved.toLocaleString()} res</span>
                <span style={{ color: 'var(--wh-status-blocked)' }}>{data.totalBlocked.toLocaleString()} blk</span>
              </p>
            </CardContent>
          </Card>

          <Card
            className="border"
            style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
          >
            <CardContent className="p-5">
              <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Stocked SKUs
              </div>
              <div className="mt-1 text-3xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
                {data.distinctSkus.toLocaleString()}
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                Distinct items with on-hand balances in scope
              </p>
            </CardContent>
          </Card>

          <Card
            className="border"
            style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
          >
            <CardContent className="p-5">
              <div className="text-xs font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                Occupied bins
              </div>
              <div className="mt-1 text-3xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
                {data.occupiedBins.toLocaleString()}
              </div>
              <p className="mt-2 text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                Bins holding non-zero stock in scope
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardSection>

      {categoriesForCharts.length === 0 ? (
        <DashboardSection title="Categories">
          <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            No parent categories with multiple stocked subcategories found for this scope.
          </p>
        </DashboardSection>
      ) : (
        <>
          <DashboardKpiGrid>
            {categoriesForCharts.map((d) => (
              <DashboardKpiCard
                key={d.key}
                href={categoryHref(d.key)}
                label={
                  <span className="flex items-center gap-2">
                    <CategoryPickerIcon iconUrl={d.iconUrl} fallback={Layers} size={18} />
                    <span>{d.label}</span>
                  </span>
                }
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
              action={`${totalOnHandReported.toLocaleString()} units in view`}
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
                title={
                  <span className="flex items-center gap-2">
                    <CategoryPickerIcon iconUrl={group.parentIconUrl} fallback={Layers} size={18} />
                    <span>{group.parentLabel}</span>
                  </span>
                }
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
                        <span className="flex min-w-0 items-center gap-2">
                          <CategoryPickerIcon iconUrl={row.iconUrl} fallback={Layers} size={16} />
                          <span className="min-w-0 truncate">{row.name}</span>
                        </span>
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
