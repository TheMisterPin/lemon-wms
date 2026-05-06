import type { ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

function Shimmer({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn('bg-wh-card-bg-soft', className)}
      style={{ border: '1px solid var(--wh-border)' }}
    />
  )
}

/** Mirrors category KPI `Card` — gradient shell + icon row, “Total on hand”, three status dots. */
function CategoryKpiCardSkeleton() {
  return (
    <div
      className="rounded-2xl border"
      style={{
        background: 'linear-gradient(135deg, rgba(148,163,184,0.12), rgba(148,163,184,0.22))',
        borderColor: 'var(--wh-border)',
        boxShadow: '0 8px 22px rgba(0,0,0,0.18)'
      }}
    >
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Shimmer className="h-[18px] w-[18px] shrink-0 rounded" />
          <Shimmer className="h-4 w-28 rounded" />
        </div>
        <div className="space-y-2">
          <Shimmer className="h-3 w-28 rounded" />
          <Shimmer className="h-9 w-36 rounded-md tabular-nums" />
        </div>
        <div className="mt-2 flex justify-between gap-2">
          <Shimmer className="h-3 w-14 shrink-0 rounded-full" />
          <Shimmer className="h-3 w-14 shrink-0 rounded-full" />
          <Shimmer className="h-3 w-14 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function StockChartPanelSkeleton({ children }: { children: ReactNode }) {
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

/**
 * Same shell as `StockSection` in `dashboard-stock-page.tsx` — soft section, bordered header,
 * title + action row, padded body.
 */
function StockSectionSkeleton({
  titleWidthClass,
  actionWidthClass,
  children
}: {
  titleWidthClass: string
  actionWidthClass: string
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
        <Shimmer className={cn('h-5 rounded', titleWidthClass)} />
        <div className="flex shrink-0 items-center gap-2">
          <Shimmer className={cn('h-3 rounded', actionWidthClass)} />
        </div>
      </div>
      <div className="p-4 xl:p-5">{children}</div>
    </section>
  )
}

function SubcategoryTableSkeleton() {
  return (
    <StockChartPanelSkeleton>
      <div
        className="mb-2 grid grid-cols-5 gap-1 text-[11px] font-medium"
        style={{ color: 'var(--wh-text-muted)' }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Shimmer key={i} className="h-3 w-full rounded" />
        ))}
      </div>
      <div className="space-y-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-1">
            <Shimmer className="h-4 w-full rounded" />
            <Shimmer className="h-4 w-full rounded" />
            <Shimmer className="h-4 w-full rounded" />
            <Shimmer className="h-4 w-full rounded" />
            <Shimmer className="h-4 w-full rounded" />
          </div>
        ))}
      </div>
    </StockChartPanelSkeleton>
  )
}

const KPI_PLACEHOLDER_COUNT = 4
const CHART_LEGEND_ROWS = 4

/**
 * Layout parity with `DashboardStockPage`: same max-width, vertical rhythm, header row,
 * `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` KPI strip (4 placeholders), chart row, two table cards.
 */
export function DashboardStockPageSkeleton() {
  return (
    <div
      className="mx-auto min-h-screen max-w-7xl space-y-8 p-4 text-wh-text-primary xl:space-y-10 xl:p-6"
      style={{ background: 'var(--wh-page-bg)' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 space-y-3">
          <Shimmer className="h-9 w-52 max-w-full rounded-md md:h-10 md:w-56" />
          <Shimmer className="h-4 w-full max-w-3xl rounded" />
        </div>
        <Shimmer className="h-5 w-5 shrink-0 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: KPI_PLACEHOLDER_COUNT }).map((_, i) => (
          <CategoryKpiCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
        <StockSectionSkeleton titleWidthClass="w-40" actionWidthClass="w-28 xl:w-32">
          <StockChartPanelSkeleton>
            <div className="flex h-[300px]">
              <div className="flex w-1/3 flex-col justify-center space-y-3 pr-3">
                {Array.from({ length: CHART_LEGEND_ROWS }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Shimmer className="h-3 w-3 shrink-0 rounded-full" />
                      <Shimmer className="h-4 min-w-0 flex-1 rounded" />
                    </div>
                    <Shimmer className="ml-5 h-3 w-24 rounded" />
                  </div>
                ))}
              </div>
              <div className="relative flex w-2/3 items-center justify-center">
                <Shimmer className="h-[200px] w-[200px] max-h-full max-w-full shrink-0 rounded-full" />
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-1">
                  <Shimmer className="h-3 w-24 rounded" />
                  <Shimmer className="h-8 w-28 rounded-md" />
                  <Shimmer className="h-3 w-10 rounded" />
                </div>
              </div>
            </div>
          </StockChartPanelSkeleton>
        </StockSectionSkeleton>

        <StockSectionSkeleton titleWidthClass="w-36" actionWidthClass="w-20">
          <StockChartPanelSkeleton>
            <div className="flex h-[300px] flex-col">
              <div className="flex min-h-0 flex-1 gap-2">
                <div className="flex w-[100px] flex-col justify-center gap-3 xl:w-[120px]">
                  {Array.from({ length: CHART_LEGEND_ROWS }).map((_, i) => (
                    <Shimmer key={i} className="h-4 w-full rounded" />
                  ))}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 py-2">
                  {Array.from({ length: CHART_LEGEND_ROWS }).map((_, i) => (
                    <Shimmer key={i} className="h-7 w-full rounded-md" />
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 justify-center gap-6 pt-2">
                <Shimmer className="h-3 w-20 rounded-full" />
                <Shimmer className="h-3 w-20 rounded-full" />
                <Shimmer className="h-3 w-16 rounded-full" />
              </div>
            </div>
          </StockChartPanelSkeleton>
        </StockSectionSkeleton>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
        <StockSectionSkeleton titleWidthClass="w-32" actionWidthClass="w-28">
          <SubcategoryTableSkeleton />
        </StockSectionSkeleton>
        <StockSectionSkeleton titleWidthClass="w-44" actionWidthClass="w-28">
          <SubcategoryTableSkeleton />
        </StockSectionSkeleton>
      </div>
    </div>
  )
}
