'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/zones/components/zone-overview-dashboard-skeleton.md
 */

export function ZoneOverviewDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-56 animate-pulse rounded" style={{ background: 'var(--wh-card-bg-soft)' }} />
          <div className="h-9 w-64 max-w-full animate-pulse rounded" style={{ background: 'var(--wh-card-bg-soft)' }} />
          <div className="h-4 w-80 max-w-full animate-pulse rounded" style={{ background: 'var(--wh-card-bg-soft)' }} />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-full" style={{ background: 'var(--wh-card-bg-soft)' }} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg border"
            style={{ background: 'var(--wh-card-bg)', borderColor: 'var(--wh-border)' }}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl border" style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }} />
        <div className="h-72 animate-pulse rounded-2xl border" style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }} />
      </div>
      <div className="h-48 animate-pulse rounded-2xl border" style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }} />
    </div>
  )
}
