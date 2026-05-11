'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/orders/order-detail-page-client.md
 */

import Link from 'next/link'

import { OrderDetailDashboard } from '@/components/features/orders/components/order-detail-dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { useOrderDetailDashboard } from '@/hooks/dashboard/orders/use-order-detail-dashboard'

export function OrderDetailPageClient({ orderType, orderId }: { orderType: string; orderId: string }) {
  const { data, isLoading, error, refetch } = useOrderDetailDashboard(orderType, orderId)

  if (isLoading) {
    return (
      <main className="min-h-screen p-4 xl:p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto max-w-7xl space-y-6">
          <Skeleton className="h-28 w-full rounded-2xl bg-wh-card-bg-soft" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl bg-wh-card-bg-soft" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-2xl bg-wh-card-bg-soft" />
          <Skeleton className="h-64 rounded-2xl bg-wh-card-bg-soft" />
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
              {error ?? 'Could not load order detail dashboard.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => void refetch()}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-action-bg)',
                  border: '1px solid var(--wh-action-border)',
                  color: 'var(--wh-action-text)'
                }}
              >
                Try again
              </button>
              <Link
                href="/dashboard/orders"
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  border: '1px solid var(--wh-border)',
                  color: 'var(--wh-text-primary)'
                }}
              >
                Back to Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return <OrderDetailDashboard data={data} />
}
