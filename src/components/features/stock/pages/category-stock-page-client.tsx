'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/stock/category-stock-page-client.md
 */

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, Layers } from 'lucide-react'
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

import { CategoryPickerIcon } from '@/components/primitives/media/category-icon'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useCategoryStockDashboard } from '@/hooks/dashboard/stock/use-category-stock-dashboard'
import type { StockItemSummaryRow } from '@/types/category-stock-dashboard.types'
import CategoryStockPageSkeleton from '../skeletons/category-stock-page-skeleton'

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
  iconUrl: string | null
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
  title: ReactNode
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

  const scopedSubcategoryGroups = useMemo(() => {
    if (!data) {
      return []
    }

    if (categoryId) {
      return data.subcategoryGroups
    }

    return data.subcategoryGroups.filter((g) => g.rows.length > 1)
  }, [data, categoryId])

  const subcategoriesForCards = useMemo((): SubcategoryCardDatum[] => {
    const rows = scopedSubcategoryGroups.flatMap((group) => group.rows)

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
        iconUrl: row.iconUrl,
        color: chartColors[index % chartColors.length]
      }))
  }, [scopedSubcategoryGroups])

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
      iconUrl: row.iconUrl,
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
        iconUrl: string | null
        items: StockItemSummaryRow[]
      }>
    }

    const itemsSource =
      categoryId !== undefined && categoryId !== ''
        ? data.items
        : data.items.filter((item) =>
          scopedSubcategoryGroups.some((g) => g.rows.some((r) => r.name === item.categoryName))
        )

    const grouped = new Map<string, StockItemSummaryRow[]>()
    for (const item of itemsSource) {
      const key = item.categoryName
      const list = grouped.get(key) ?? []
      list.push(item)
      grouped.set(key, list)
    }

    return [...grouped.entries()]
      .map(([categoryName, items]) => {
        let iconUrl: string | null = null
        for (const g of scopedSubcategoryGroups) {
          const row = g.rows.find((r) => r.name === categoryName)
          if (row) {
            iconUrl = row.iconUrl ?? null
            break
          }
        }

        return {
          categoryId: categoryName,
          categoryName,
          iconUrl,
          items: items.slice().sort((a, b) => b.quantity - a.quantity)
        }
      })
      .sort(
        (a, b) =>
          b.items.reduce((sum, item) => sum + item.quantity, 0)
          - a.items.reduce((sum, item) => sum + item.quantity, 0)
      )
  }, [data, categoryId, scopedSubcategoryGroups])

  const [itemsSheetSubcategory, setItemsSheetSubcategory] = useState<string | null>(null)

  const activeItemsSheetGroup = useMemo(
    () => itemsBySubcategory.find((group) => group.categoryId === itemsSheetSubcategory) ?? null,
    [itemsBySubcategory, itemsSheetSubcategory]
  )

  const itemsInScopeCount = useMemo(() => {
    if (!data) {
      return 0
    }

    if (categoryId !== undefined && categoryId !== '') {
      return data.items.length
    }

    return data.items.filter((item) =>
      scopedSubcategoryGroups.some((g) => g.rows.some((r) => r.name === item.categoryName))
    ).length
  }, [data, categoryId, scopedSubcategoryGroups])

  if (isLoading) {
    return (
      <CategoryStockPageSkeleton/>
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

  return (
    <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
      <div className="mx-auto min-h-screen max-w-7xl space-y-8 p-4 text-wh-text-primary xl:space-y-10 xl:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              {categoryId !== undefined && categoryId !== '' ? (
                <span
                  className="inline-flex shrink rounded-lg border p-1.5"
                  style={{ borderColor: 'var(--wh-border)', background: 'var(--wh-card-bg)' }}
                >
                  <CategoryPickerIcon
                    iconUrl={data.selectedCategoryIconUrl}
                    fallback={LayoutGrid}
                    size={36}
                  />
                </span>
              ) : null}
              <span>{data.header.title}</span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
              {data.header.subtitle}
              <span style={{ color: 'var(--wh-text-secondary)' }}>
                {' · '}
                {subcategoriesForCards.length.toLocaleString()} subcategories · {itemsInScopeCount.toLocaleString()} items
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
                        <div className="flex items-start gap-2">
                          <span
                            className="mt-0.5 inline-flex shrink rounded-md border p-1"
                            style={{ borderColor: 'var(--wh-border)', background: 'var(--wh-card-bg)' }}
                          >
                            <CategoryPickerIcon iconUrl={sub.iconUrl} fallback={Layers} size={22} />
                          </span>
                          <div className="min-w-0 flex-1">
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
                          </div>
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
                  <div className="flex h-[300px] min-h-0">
                    <div className="flex w-1/3 flex-col justify-center space-y-3 pr-3">
                      {subcategoriesForCards.map((sub) => {
                        const pct = totalOnHand > 0 ? ((sub.onHand / totalOnHand) * 100).toFixed(1) : '0'

                        return (
                          <div key={`legend-${sub.categoryId}`} className="text-sm" style={{ color: 'var(--wh-text-primary)' }}>
                            <div className="flex items-center gap-2">
                              <CategoryPickerIcon iconUrl={sub.iconUrl} fallback={Layers} size={16} />
                              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: sub.color }} aria-hidden />
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
                  <div className="h-[300px] w-full min-w-0 shrink-0">
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
                      </Link>
                    ))}
                  </div>
                </StockChartPanel>
              </StockSection>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
              {itemsBySubcategory.map((group, groupIndex) => {
                const visibleItems = group.items.slice(0, 8)
                const hiddenItemsCount = Math.max(0, group.items.length - visibleItems.length)

                return (
                  <StockSection
                    key={`items-${group.categoryId}`}
                    title={
                      <span className="flex items-center gap-2">
                        <CategoryPickerIcon iconUrl={group.iconUrl} fallback={Layers} size={20} />
                        <span>{group.categoryName}</span>
                      </span>
                    }
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
                        {visibleItems.map((item, idx) => {
                          const rowColor = chartColors[(groupIndex * 37 + idx) % chartColors.length]

                          return (
                            <Link
                              key={item.itemId}
                              href={item.href}
                              className="grid grid-cols-6 gap-1 rounded-md py-0.5 pl-2 transition-opacity hover:opacity-90"
                              style={{ borderLeft: `4px solid ${rowColor}` }}
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
                          )
                        })}
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
                      <div className="flex items-start gap-2">
                        <span
                          className="mt-0.5 inline-flex shrink rounded-md border p-1"
                          style={{ borderColor: 'var(--wh-border)', background: 'var(--wh-card-bg)' }}
                        >
                          <CategoryPickerIcon iconUrl={sub.iconUrl} fallback={Layers} size={22} />
                        </span>
                        <div className="min-w-0 flex-1">
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
                        </div>
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

            {activeItemsSheetGroup?.items.map((item, idx) => {
              const rowColor = chartColors[idx % chartColors.length]

              return (
                <Link
                  key={`sheet-item-${item.itemId}`}
                  href={item.href}
                  className="grid grid-cols-6 gap-1 rounded-md py-0.5 pl-2 text-sm transition-opacity hover:opacity-90"
                  style={{ color: 'var(--wh-text-primary)', borderLeft: `4px solid ${rowColor}` }}
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
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
