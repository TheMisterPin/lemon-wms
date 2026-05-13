'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/orders/dashboard-orders-page-view.md
 */

import { OrderTypeOverview } from '@/components/features/orders/components/order-type-overview'
import { OrderTypeOverviewSkeleton } from '@/components/features/orders/skeletons/order-type-overview-skeleton'
import { Button } from '@/components/ui/button'
import { useOrderTypeDashboard } from '@/hooks/dashboard/orders/use-order-type-dashboard'

const SUPPORTED_ORDER_TYPES = new Set(['purchase', 'sales', 'transfer'])

export function DashboardOrdersPageView({ orderType }: { orderType: string }) {
  const normalized = orderType.trim().toLowerCase()
  const isSupported = SUPPORTED_ORDER_TYPES.has(normalized)
  const isPurchase = normalized === 'purchase'

  const { data, isLoading, error, refetch } = useOrderTypeDashboard(orderType, isSupported)

  const pageTitle = `${orderType.charAt(0).toUpperCase()}${orderType.slice(1)} orders`

  if (!isSupported) {
    return (
      <main className="flex h-full select-none flex-col overflow-hidden bg-linear-to-b from-page-bg-from to-page-bg-to">
        <div className="mx-auto flex w-full max-w-[1200px] origin-top flex-1 flex-col overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <header className="mt-2">
            <h1 className="text-2xl font-semibold text-brand-text">{pageTitle}</h1>
          </header>
          <p className="mt-4 text-sm text-brand-muted">
            This order type is not available in the dashboard yet. Supported types: purchase, sales, and
            transfer.
          </p>
        </div>
      </main>
    )
  }

  if (isLoading && !data) {
    return <OrderTypeOverviewSkeleton />
  }

  if ((!isLoading && error) || !data) {
    return (
      <main className="min-h-screen p-6" style={{ background: 'var(--wh-page-bg)' }}>
        <div
          className="mx-auto max-w-lg rounded-xl border px-6 py-8 text-center"
          style={{
            borderColor: 'var(--wh-border)',
            background: 'var(--wh-card-bg-soft)'
          }}
        >
          <p className="text-sm" style={{ color: 'var(--wh-text-muted)' }}>
            {error ?? 'Could not load order dashboard.'}
          </p>
          <Button type="button" variant="outline" className="mt-6" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </main>
    )
  }

  return (
    <OrderTypeOverview
      data={data}
      purchaseListActions={
        isPurchase
          ? {
            existingOrderCount: data.orders.length,
            onPurchaseCreated: async () => {
              await refetch()
            }
          }
          : undefined
      }
    />
  )
}
