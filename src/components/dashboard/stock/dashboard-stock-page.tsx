'use client'

import type { ComponentType, ReactNode } from 'react'
import { useMemo } from 'react'
import { Armchair, Loader2, Package, Pill, Shirt, Utensils } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { DashboardStockPageSkeleton } from '@/components/dashboard/stock/dashboard-stock-page-skeleton'
import { useDashboardStock } from '@/components/dashboard/stock/use-dashboard-stock'
import { Card, CardContent } from '@/components/ui/card'
import type { StockDashboardCategoryRow } from '@/types/stock-dashboard.types'

const chartColors = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#ec4899', '#06b6d4', '#8b5cf6']

const categoryIcons: ComponentType<{ size?: number }>[] = [
  Shirt,
  Utensils,
  Pill,
  Armchair,
  Package
]

const rechartsTooltip = {
  contentStyle: {
    background: 'var(--wh-card-bg)',
    border: '1px solid var(--wh-border)',
    borderRadius: '8px',
    color: 'var(--wh-text-primary)',
    fontSize: 12
  } as const,
  labelStyle: { color: 'var(--wh-text-secondary)' } as const,
  itemStyle: { color: 'var(--wh-text-primary)' } as const
}

function StockSection({
  title,
  action,
  headerRight,
  children
}: {
  title: string
  action?: string
  headerRight?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      className="rounded-2xl"
      style={{
        background: 'var(--wh-card-bg-soft)',
        border: '1px solid var(--wh-border)'
      }}
    >
      <div
        className="flex items-center justify-between gap-2 border-b px-4 py-3 xl:px-5"
        style={{ borderColor: 'var(--wh-border)' }}
      >
        <div
          className="min-w-0 text-sm font-semibold xl:text-base"
          style={{ color: 'var(--wh-text-primary)' }}
        >
          {title}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {action ? (
            <div className="text-[11px] xl:text-xs" style={{ color: 'var(--wh-text-muted)' }}>
              {action}
            </div>
          ) : null}
          {headerRight}
        </div>
      </div>

      <div className="p-4 xl:p-5">{children}</div>
    </section>
  )
}

function StockChartPanel({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl p-3 xl:p-4"
      style={{
        background: 'var(--wh-card-bg)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.24)',
        border: '1px solid var(--wh-border)'
      }}
    >
      {children}
    </div>
  )
}

type CategoryChartDatum = StockDashboardCategoryRow & {
  color: string
  Icon: ComponentType<{ size?: number }>
}

export function DashboardStockPage() {
  const { isLoading, error, refetch, data } = useDashboardStock()

  const categoriesForCharts = useMemo((): CategoryChartDatum[] => {
    if (!data) {
      return []
    }

    return data.categories.map((c, i) => ({
      ...c,
      color: chartColors[i % chartColors.length],
      Icon: categoryIcons[i % categoryIcons.length]
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
      <div
        className="min-h-screen p-6"
        style={{ background: 'var(--wh-page-bg)', color: 'var(--wh-text-primary)' }}
      >
        <div
          className="mx-auto max-w-lg rounded-xl border px-6 py-8 text-center"
          style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg-soft)'
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--wh-text-muted)' }}>
            {error ?? 'Could not load stock dashboard.'}
          </p>
          <button
            type="button"
            className="mt-6 rounded-lg px-4 py-2 text-sm font-medium"
            style={{
              background: 'var(--wh-card-bg)',
              border: '1px solid var(--wh-border)',
              color: 'var(--wh-text-primary)'
            }}
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const subtitle =
    data.warehouseId !== null && data.warehouseId !== ''
      ? 'Warehouse-scoped stock rollups'
      : 'Network-wide aggregates across all warehouses'

  return (
    <div
      className="mx-auto min-h-screen max-w-7xl space-y-8 p-4 text-wh-text-primary xl:space-y-10 xl:p-6"
      style={{ background: 'var(--wh-page-bg)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Stock overview</h1>
          <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            {subtitle} ·{' '}
            <span style={{ color: 'var(--wh-text-secondary)' }}>
              {data.distinctSkus.toLocaleString()} SKUs · {data.occupiedBins.toLocaleString()} occupied bins ·{' '}
              {data.totalAvailable.toLocaleString()} avail · {data.totalReserved.toLocaleString()} reserved ·{' '}
              {data.totalBlocked.toLocaleString()} blocked
            </span>
          </p>
        </div>
        {isLoading ? (
          <Loader2 className="size-5 animate-spin shrink-0" style={{ color: 'var(--wh-text-muted)' }} />
        ) : null}
      </div>

      {categoriesForCharts.length === 0 ? (
        <StockSection title="Categories">
          <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            No category stock balances found for this scope.
          </p>
        </StockSection>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categoriesForCharts.map((d) => {
              const Icon = d.Icon

              return (
                <Card
                  key={d.key}
                  className="border"
                  style={{
                    background: `linear-gradient(135deg, ${d.color}22, ${d.color}aa)`,
                    borderColor: 'var(--wh-border)'
                  }}
                >
                  <CardContent className="space-y-3 p-5">
                    <div
                      className="flex items-center gap-2 text-sm opacity-90"
                      style={{ color: 'var(--wh-text-primary)' }}
                    >
                      <Icon size={18} /> {d.label}
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                        Total On Hand
                      </div>
                      <div className="text-3xl font-bold">{d.totalOnHand.toLocaleString()}</div>
                    </div>
                    <div className="mt-2 flex justify-between text-xs">
                      <span style={{ color: 'var(--wh-status-available)' }}>● {d.totalAvailable}</span>
                      <span style={{ color: 'var(--wh-status-full)' }}>● {d.totalReserved}</span>
                      <span style={{ color: 'var(--wh-status-blocked)' }}>● {d.totalBlocked}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
            <StockSection
              title="On-hand by category"
              action={`${totalOnHandReported.toLocaleString()} units total`}
            >
              <StockChartPanel>
                <div className="flex h-[300px]">
                  <div className="flex w-1/3 flex-col justify-center space-y-3 pr-3">
                    {categoriesForCharts.map((d) => {
                      const pct =
                        totalOnHandReported > 0 ? ((d.totalOnHand / totalOnHandReported) * 100).toFixed(1) : '0'

                      return (
                        <div key={d.key} className="text-sm" style={{ color: 'var(--wh-text-primary)' }}>
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: d.color }} />
                            <span className="min-w-0 truncate">{d.label}</span>
                          </div>
                          <div className="ml-5 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                            {pct}% · {d.totalOnHand.toLocaleString()}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="relative w-2/3">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoriesForCharts}
                          dataKey="totalOnHand"
                          nameKey="label"
                          innerRadius={64}
                          outerRadius={100}
                        >
                          {categoriesForCharts.map((entry) => (
                            <Cell key={entry.key} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip {...rechartsTooltip} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <div
                        className="text-[10px] font-medium uppercase tracking-wide"
                        style={{ color: 'var(--wh-text-muted)' }}
                      >
                        Total on hand
                      </div>
                      <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
                        {totalOnHandReported.toLocaleString()}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                        100%
                      </div>
                    </div>
                  </div>
                </div>
              </StockChartPanel>
            </StockSection>

            <StockSection title="Stock breakdown" action="By status">
              <StockChartPanel>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoriesForCharts}
                      layout="vertical"
                      margin={{ top: 4, right: 8, left: 8, bottom: 4 }}
                    >
                      <XAxis
                        type="number"
                        stroke="var(--wh-text-muted)"
                        tick={{ fill: 'var(--wh-text-muted)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--wh-border)' }}
                      />
                      <YAxis
                        dataKey="label"
                        type="category"
                        width={120}
                        stroke="var(--wh-text-muted)"
                        tick={{ fill: 'var(--wh-text-primary)', fontSize: 11 }}
                        axisLine={{ stroke: 'var(--wh-border)' }}
                      />
                      <Tooltip {...rechartsTooltip} />
                      <Legend
                        wrapperStyle={{ color: 'var(--wh-text-secondary)', fontSize: 12, paddingTop: 8 }}
                      />
                      <Bar dataKey="totalAvailable" name="Available" stackId="a" fill="var(--wh-status-available)" />
                      <Bar dataKey="totalReserved" name="Reserved" stackId="a" fill="var(--wh-status-full)" />
                      <Bar dataKey="totalBlocked" name="Blocked" stackId="a" fill="var(--wh-status-blocked)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </StockChartPanel>
            </StockSection>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
            {subcategoryPanels.map((group) => (
              <StockSection
                key={group.parentKey}
                title={group.parentLabel}
                action={`${group.rows.length} subcategories`}
              >
                <StockChartPanel>
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
                </StockChartPanel>
              </StockSection>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
