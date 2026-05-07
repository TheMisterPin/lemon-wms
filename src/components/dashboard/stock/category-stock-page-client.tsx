'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/stock/category-stock-page-client.md
 */


import Link from 'next/link'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
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

import { useCategoryStockDashboard } from '@/components/dashboard/stock/use-category-stock-dashboard'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import type { StockItemSummaryRow } from '@/types/category-stock-dashboard.types'

const chartColors = ['#22c55e', '#3b82f6', '#a855f7', '#f97316', '#eab308', '#ec4899', '#06b6d4', '#8b5cf6']

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

type SubcategoryCardDatum = {
  categoryId: string
  label: string
  onHand: number
  available: number
  reserved: number
  blocked: number
  href: string
  color: string
}

type StockBreakdownDatum = {
  label: string
  totalAvailable: number
  totalReserved: number
  totalBlocked: number
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
        <div className="min-w-0 text-sm font-semibold xl:text-base" style={{ color: 'var(--wh-text-primary)' }}>
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

export function CategoryStockPageClient({ categoryId }: { categoryId?: string }) {
  const { data, isLoading, error, refetch } = useCategoryStockDashboard(categoryId)
  const [showSubcategoriesSheet, setShowSubcategoriesSheet] = useState(false)

  const subcategoriesForCards = useMemo((): SubcategoryCardDatum[] => {
    if (!data) {
      return []
    }

    const rows = data.subcategoryGroups.flatMap((group) => group.rows)

    return rows
      .slice()
      .sort((a, b) => b.onHand - a.onHand)
      .map((row, index) => ({
        categoryId: row.categoryId,
        label: row.name,
        onHand: row.onHand,
        available: row.available,
        reserved: row.reserved,
        blocked: row.blocked,
        href: row.href,
        color: chartColors[index % chartColors.length]
      }))
  }, [data])

  const visibleSubcategories = subcategoriesForCards.slice(0, 4)
  const hiddenSubcategories = subcategoriesForCards.slice(4)

  const totalOnHand = useMemo(
    () => subcategoriesForCards.reduce((sum, row) => sum + row.onHand, 0),
    [subcategoriesForCards]
  )

  const stockBreakdownRows = useMemo((): StockBreakdownDatum[] => {
    return subcategoriesForCards.map((row) => ({
      label: row.label,
      totalAvailable: row.available,
      totalReserved: row.reserved,
      totalBlocked: row.blocked
    }))
  }, [subcategoriesForCards])

  const subcategoryTableRows = useMemo(() => {
    return subcategoriesForCards.map((row) => ({
      categoryId: row.categoryId,
      name: row.label,
      onHand: row.onHand,
      available: row.available,
      reserved: row.reserved,
      blocked: row.blocked,
      href: row.href
    }))
  }, [subcategoriesForCards])

  const itemsBySubcategory = useMemo(() => {
    if (!data) {
      return [] as Array<{
        categoryId: string
        categoryName: string
        items: StockItemSummaryRow[]
      }>
    }

    const grouped = new Map<string, StockItemSummaryRow[]>()
    for (const item of data.items) {
      const key = item.categoryName
      const list = grouped.get(key) ?? []
      list.push(item)
      grouped.set(key, list)
    }

    return [...grouped.entries()]
      .map(([categoryName, items]) => ({
        categoryId: categoryName,
        categoryName,
        items: items.slice().sort((a, b) => b.quantity - a.quantity)
      }))
      .sort(
        (a, b) =>
          b.items.reduce((sum, item) => sum + item.quantity, 0)
          - a.items.reduce((sum, item) => sum + item.quantity, 0)
      )
  }, [data])

  const [itemsSheetSubcategory, setItemsSheetSubcategory] = useState<string | null>(null)

  const activeItemsSheetGroup = useMemo(
    () => itemsBySubcategory.find((group) => group.categoryId === itemsSheetSubcategory) ?? null,
    [itemsBySubcategory, itemsSheetSubcategory]
  )

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-28 w-full rounded-2xl bg-wh-card-bg-soft" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 rounded-xl bg-wh-card-bg-soft" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
            <Skeleton className="h-80 rounded-2xl bg-wh-card-bg-soft" />
            <Skeleton className="h-80 rounded-2xl bg-wh-card-bg-soft" />
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
            <Skeleton className="h-64 rounded-2xl bg-wh-card-bg-soft" />
            <Skeleton className="h-64 rounded-2xl bg-wh-card-bg-soft" />
          </div>
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto flex max-w-7xl items-center justify-center p-6 xl:p-10">
          <div
            className="w-full max-w-lg rounded-2xl px-6 py-10 text-center"
            style={{
              background: 'var(--wh-card-bg-soft)',
              border: '1px solid var(--wh-border)'
            }}
          >
            <p className="text-sm" style={{ color: 'var(--wh-text-primary)' }}>
              {error ?? 'Could not load category stock dashboard.'}
            </p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-6 rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
              style={{
                background: 'var(--wh-action-bg)',
                border: '1px solid var(--wh-action-border)',
                color: 'var(--wh-action-text)'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    )
  }

  const subtitle = categoryId
    ? `Subcategory rollups for ${categoryId}`
    : 'Subcategory rollups across categories'

  return (
    <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
      <div className="mx-auto min-h-screen max-w-7xl space-y-8 p-4 text-wh-text-primary xl:space-y-10 xl:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{data.header.title}</h1>
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              {subtitle} ·{' '}
              <span style={{ color: 'var(--wh-text-secondary)' }}>
                {subcategoriesForCards.length.toLocaleString()} subcategories · {data.items.length.toLocaleString()} items
              </span>
            </p>
          </div>
        </div>

        {subcategoriesForCards.length === 0 ? (
          <StockSection title="Subcategories">
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              No subcategory stock balances found for this scope.
            </p>
          </StockSection>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {visibleSubcategories.map((sub) => {
                return (
                  <Link key={sub.categoryId} href={sub.href} className="block transition-opacity hover:opacity-90">
                    <Card
                      className="border"
                      style={{
                        background: 'var(--wh-card-bg-soft)',
                        borderColor: 'var(--wh-border)'
                      }}
                    >
                      <CardContent className="space-y-3 p-5">
                        <div className="text-sm font-medium" style={{ color: 'var(--wh-text-primary)' }}>
                          {sub.label}
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                            Total On Hand
                          </div>
                          <div className="text-3xl font-bold">{sub.onHand.toLocaleString()}</div>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                          <span style={{ color: 'var(--wh-text-secondary)' }}>Avail {sub.available.toLocaleString()}</span>
                          <span style={{ color: 'var(--wh-text-secondary)' }}>Res {sub.reserved.toLocaleString()}</span>
                          <span style={{ color: 'var(--wh-text-secondary)' }}>Blocked {sub.blocked.toLocaleString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {hiddenSubcategories.length > 0 ? (
              <div className="-mt-3">
                <button
                  type="button"
                  onClick={() => setShowSubcategoriesSheet(true)}
                  className="w-full rounded-lg border p-3 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    background: 'var(--wh-card-bg-soft)',
                    borderColor: 'var(--wh-border)',
                    color: 'var(--wh-text-primary)'
                  }}
                >
                  See more ({hiddenSubcategories.length})
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
              <StockSection
                title="On-hand by sub category"
                action={`${totalOnHand.toLocaleString()} units total`}
              >
                <StockChartPanel>
                  <div className="flex h-75">
                    <div className="flex w-1/3 flex-col justify-center space-y-3 pr-3">
                      {subcategoriesForCards.map((sub) => {
                        const pct = totalOnHand > 0 ? ((sub.onHand / totalOnHand) * 100).toFixed(1) : '0'

                        return (
                          <div key={`legend-${sub.categoryId}`} className="text-sm" style={{ color: 'var(--wh-text-primary)' }}>
                            <div className="flex items-center gap-2">
                              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: sub.color }} />
                              <span className="min-w-0 truncate">{sub.label}</span>
                            </div>
                            <div className="ml-5 text-xs" style={{ color: 'var(--wh-text-muted)' }}>
                              {pct}% · {sub.onHand.toLocaleString()}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="relative w-2/3">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={subcategoriesForCards}
                            dataKey="onHand"
                            nameKey="label"
                            innerRadius={64}
                            outerRadius={100}
                          >
                            {subcategoriesForCards.map((entry) => (
                              <Cell key={`donut-${entry.categoryId}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip {...rechartsTooltip} />
                        </PieChart>
                      </ResponsiveContainer>

                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: 'var(--wh-text-muted)' }}>
                          Total on hand
                        </div>
                        <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--wh-text-primary)' }}>
                          {totalOnHand.toLocaleString()}
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
                  <div className="h-75">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stockBreakdownRows} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
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
                        <Legend wrapperStyle={{ color: 'var(--wh-text-secondary)', fontSize: 12, paddingTop: 8 }} />
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
              <StockSection title={`Sub categories (${subcategoryTableRows.length})`}>
                <StockChartPanel>
                  <div className="mb-2 grid grid-cols-5 gap-1 text-[11px] font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                    <span>Sub category</span>
                    <span>On hand</span>
                    <span>Available</span>
                    <span>Reserved</span>
                    <span>Blocked</span>
                  </div>
                  <div className="space-y-1.5 text-sm" style={{ color: 'var(--wh-text-primary)' }}>
                    {subcategoryTableRows.map((row) => (
                      <Link key={`sub-row-${row.categoryId}`} href={row.href} className="grid grid-cols-5 gap-1 transition-opacity hover:opacity-90">
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
                      </Link>
                    ))}
                  </div>
                </StockChartPanel>
              </StockSection>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
              {itemsBySubcategory.map((group) => {
                const visibleItems = group.items.slice(0, 8)
                const hiddenItemsCount = Math.max(0, group.items.length - visibleItems.length)

                return (
                  <StockSection
                    key={`items-${group.categoryId}`}
                    title={group.categoryName}
                    action={`${group.items.length} items`}
                  >
                    <StockChartPanel>
                      <div className="mb-2 grid grid-cols-6 gap-1 text-[11px] font-medium" style={{ color: 'var(--wh-text-muted)' }}>
                        <span>SKU</span>
                        <span>Item</span>
                        <span>On hand</span>
                        <span>Available</span>
                        <span>Reserved</span>
                        <span>Blocked</span>
                      </div>

                      <div className="space-y-1.5 text-sm" style={{ color: 'var(--wh-text-primary)' }}>
                        {visibleItems.map((item) => (
                          <Link
                            key={item.itemId}
                            href={item.href}
                            className="grid grid-cols-6 gap-1 transition-opacity hover:opacity-90"
                          >
                            <span className="min-w-0 truncate">{item.sku}</span>
                            <span className="min-w-0 truncate">{item.name}</span>
                            <span className="tabular-nums">{item.quantity.toLocaleString()}</span>
                            <span className="tabular-nums" style={{ color: 'var(--wh-status-available)' }}>
                              {item.available.toLocaleString()}
                            </span>
                            <span className="tabular-nums" style={{ color: 'var(--wh-status-full)' }}>
                              {item.reserved.toLocaleString()}
                            </span>
                            <span className="tabular-nums" style={{ color: 'var(--wh-status-blocked)' }}>
                              {item.blocked.toLocaleString()}
                            </span>
                          </Link>
                        ))}
                      </div>

                      {hiddenItemsCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => setItemsSheetSubcategory(group.categoryId)}
                          className="mt-3 w-full rounded-lg border p-3 text-sm font-medium transition-opacity hover:opacity-90"
                          style={{
                            background: 'var(--wh-card-bg-soft)',
                            borderColor: 'var(--wh-border)',
                            color: 'var(--wh-text-primary)'
                          }}
                        >
                          See more ({hiddenItemsCount})
                        </button>
                      ) : null}
                    </StockChartPanel>
                  </StockSection>
                )
              })}
            </div>
          </>
        )}
      </div>

      <Sheet open={showSubcategoriesSheet} onOpenChange={setShowSubcategoriesSheet}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>All Subcategories ({subcategoriesForCards.length})</SheetTitle>
          </SheetHeader>
          <div className="mt-6 grid grid-cols-1 gap-3 pr-6">
            {subcategoriesForCards.map((sub) => {
              return (
                <Link key={`sheet-${sub.categoryId}`} href={sub.href} className="block transition-opacity hover:opacity-90">
                  <Card
                    className="border"
                    style={{
                      background: 'var(--wh-card-bg-soft)',
                      borderColor: 'var(--wh-border)'
                    }}
                  >
                    <CardContent className="space-y-3 p-5">
                      <div className="text-sm font-medium" style={{ color: 'var(--wh-text-primary)' }}>
                        {sub.label}
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: 'var(--wh-text-secondary)' }}>
                          Total On Hand
                        </div>
                        <div className="text-3xl font-bold">{sub.onHand.toLocaleString()}</div>
                      </div>
                      <div className="mt-2 flex justify-between text-xs">
                        <span style={{ color: 'var(--wh-text-secondary)' }}>Avail {sub.available.toLocaleString()}</span>
                        <span style={{ color: 'var(--wh-text-secondary)' }}>Res {sub.reserved.toLocaleString()}</span>
                        <span style={{ color: 'var(--wh-text-secondary)' }}>Blocked {sub.blocked.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet
        open={itemsSheetSubcategory !== null}
        onOpenChange={(open) => {
          if (!open) {
            setItemsSheetSubcategory(null)
          }
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>
              {activeItemsSheetGroup?.categoryName ?? 'Subcategory'} · All Items ({activeItemsSheetGroup?.items.length ?? 0})
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-2 pr-6">
            <div className="grid grid-cols-6 gap-1 text-[11px] font-medium" style={{ color: 'var(--wh-text-muted)' }}>
              <span>SKU</span>
              <span>Item</span>
              <span>On hand</span>
              <span>Available</span>
              <span>Reserved</span>
              <span>Blocked</span>
            </div>

            {activeItemsSheetGroup?.items.map((item) => (
              <Link
                key={`sheet-item-${item.itemId}`}
                href={item.href}
                className="grid grid-cols-6 gap-1 text-sm transition-opacity hover:opacity-90"
                style={{ color: 'var(--wh-text-primary)' }}
              >
                <span className="min-w-0 truncate">{item.sku}</span>
                <span className="min-w-0 truncate">{item.name}</span>
                <span className="tabular-nums">{item.quantity.toLocaleString()}</span>
                <span className="tabular-nums" style={{ color: 'var(--wh-status-available)' }}>
                  {item.available.toLocaleString()}
                </span>
                <span className="tabular-nums" style={{ color: 'var(--wh-status-full)' }}>
                  {item.reserved.toLocaleString()}
                </span>
                <span className="tabular-nums" style={{ color: 'var(--wh-status-blocked)' }}>
                  {item.blocked.toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
