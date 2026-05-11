'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/stock/item-detail-page-client.md
 */

import { ItemDetailDashboard } from '@/components/features/stock/components/item-detail-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useItemDetailDashboard } from '@/hooks/dashboard/stock/use-item-detail-dashboard'

export function ItemDetailPageClient({ itemId }: { itemId: string }) {
  const { data, isLoading, error, refetch } = useItemDetailDashboard(itemId)

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header skeleton */}
          <Skeleton className="h-28 w-full rounded-2xl" />

          {/* KPI totals skeleton */}
          <div className="grid grid-cols-1 gap-3">
            <Skeleton className="h-32 rounded-xl" />
          </div>

          {/* Stock by warehouse skeleton */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-36 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-12 rounded-lg" />
          </div>

          {/* Orders section skeleton */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>

          {/* Two column layout skeleton */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-lg" />
              ))}
            </div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-lg" />
              ))}
            </div>
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
              {error ?? 'Could not load item detail dashboard.'}
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
      <ItemDetailDashboard data={data} />
    </main>
  )
}
