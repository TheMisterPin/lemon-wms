'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-dashboard-overview-skeleton.md
 */

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

function OverviewHeaderSkeleton() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 flex-1 space-y-3">
        <Shimmer className="h-3 w-52 rounded max-w-full" />
        <Shimmer className="h-9 w-72 rounded-md max-w-full" />
        <Shimmer className="h-3 w-[min(420px,100%)] rounded" />
      </div>
      <div className="hidden shrink-0 items-center gap-2 md:flex">
        <Shimmer className="h-7 w-20 rounded-full" />
        <Shimmer className="h-7 w-32 rounded-full" />
        <Shimmer className="h-10 w-[90px] rounded-xl" />
        <Shimmer className="h-10 w-[100px] rounded-xl" />
      </div>
    </div>
  )
}

function KpiSkeletonTile() {
  return (
    <div
      className="rounded-lg border p-4"
      style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}
    >
      <div className="flex gap-3">
        <Shimmer className="h-8 w-8 shrink-0 rounded" />
        <div className="min-w-0 flex-1 space-y-2">
          <Shimmer className="h-3 w-24 rounded" />
          <Shimmer className="h-7 w-32 rounded-md" />
          <Shimmer className="h-3 w-[min(260px,100%)] rounded" />
        </div>
      </div>
    </div>
  )
}

function SectionGridSkeleton() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <KpiSkeletonTile key={idx} />
      ))}
    </section>
  )
}

function TwoColumnPanelsSkeleton({
  proportionClass = 'xl:grid-cols-[1.05fr_0.95fr]'
}: {
  proportionClass?: string
}) {
  return (
    <div className={`grid grid-cols-1 gap-5 ${proportionClass}`}>
      <section
        className="rounded-2xl border"
        style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
      >
        <div className="flex justify-between gap-2 border-b px-4 py-3 xl:px-5" style={{ borderColor: 'var(--wh-border)' }}>
          <Shimmer className="h-5 w-36 rounded" />
          <Shimmer className="h-7 w-24 rounded-full" />
        </div>
        <div className="space-y-3 p-4 xl:p-5">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Shimmer className="h-16 rounded-xl" />
            <Shimmer className="h-16 rounded-xl" />
            <Shimmer className="h-16 rounded-xl" />
            <Shimmer className="h-16 rounded-xl" />
          </div>
          <SectionGridSkeleton />
        </div>
      </section>

      <section
        className="rounded-2xl border"
        style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
      >
        <div className="flex justify-between gap-2 border-b px-4 py-3 xl:px-5" style={{ borderColor: 'var(--wh-border)' }}>
          <Shimmer className="h-5 w-32 rounded" />
          <Shimmer className="h-3 w-28 rounded" />
        </div>
        <div className="flex flex-col gap-4 p-4 md:flex-row xl:p-5">
          <div className="mx-auto shrink-0">
            <Shimmer className="h-[230px] w-[230px] rounded-full" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <Shimmer className="h-10 w-full rounded-lg" />
            <Shimmer className="h-10 w-full rounded-lg" />
            <Shimmer className="h-10 w-full rounded-lg" />
            <Shimmer className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </section>
    </div>
  )
}

function BottomRowSkeleton({
  proportionClass = 'xl:grid-cols-[1.25fr_0.75fr]'
}: {
  proportionClass?: string
}) {
  return (
    <div className={`grid grid-cols-1 gap-5 ${proportionClass}`}>
      <section
        className="rounded-2xl border"
        style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
      >
        <div className="flex justify-between gap-2 border-b px-4 py-3 xl:px-5" style={{ borderColor: 'var(--wh-border)' }}>
          <Shimmer className="h-5 w-32 rounded" />
          <Shimmer className="h-8 w-[84px] rounded-xl" />
        </div>
        <div className="space-y-2 p-4 xl:p-5">
          <Shimmer className="h-[140px] w-full rounded-xl" />
          <Shimmer className="h-[140px] w-full rounded-xl" />
          <Shimmer className="h-[140px] w-full rounded-xl" />
        </div>
      </section>

      <section
        className="rounded-2xl border"
        style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
      >
        <div className="flex justify-between gap-2 border-b px-4 py-3 xl:px-5" style={{ borderColor: 'var(--wh-border)' }}>
          <Shimmer className="h-5 w-36 rounded" />
          <Shimmer className="h-7 w-20 rounded-full" />
        </div>
        <div className="space-y-3 p-4 xl:p-5">
          <Shimmer className="h-[88px] w-full rounded-xl" />
          <Shimmer className="h-[88px] w-full rounded-xl" />
          <Shimmer className="h-[88px] w-full rounded-xl" />
          <Shimmer className="h-[88px] w-full rounded-xl" />
        </div>
      </section>
    </div>
  )
}

/** Skeleton matching {@link DashboardWarehouseOverviewView} (embedded variant). */
export function WarehouseDashboardOverviewSkeleton() {
  return (
    <div className="space-y-5 border-t pt-6" style={{ borderColor: 'var(--wh-border)' }}>
      <OverviewHeaderSkeleton />
      <SectionGridSkeleton />
      <TwoColumnPanelsSkeleton />
      <BottomRowSkeleton />
    </div>
  )
}
