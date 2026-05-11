'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/components/warehouse-stock-dashboard-skeleton.md
 */

export function WarehouseStockDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="space-y-2">
        <div className="h-4 w-48 animate-pulse rounded" style={{ background: 'var(--wh-card-bg-soft)' }} />
        <div className="h-9 w-2/3 max-w-md animate-pulse rounded" style={{ background: 'var(--wh-card-bg-soft)' }} />
        <div className="h-4 w-full max-w-xl animate-pulse rounded" style={{ background: 'var(--wh-card-bg-soft)' }} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg border"
            style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="h-80 animate-pulse rounded-2xl border" style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }} />
        <div className="h-80 animate-pulse rounded-2xl border" style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }} />
      </div>
      <div className="h-64 animate-pulse rounded-2xl border" style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }} />
      <div className="h-72 animate-pulse rounded-2xl border" style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }} />
    </div>
  )
}
