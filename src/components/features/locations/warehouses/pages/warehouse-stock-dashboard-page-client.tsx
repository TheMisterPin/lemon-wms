'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/warehouse-stock-dashboard-page-client.md
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useDashboardLocationResource } from '@/components/features/locations/shared/hooks/use-dashboard-location-resource'
import { DashboardWarehouseStockView } from '@/components/features/locations/warehouses/pages/dashboard-warehouse-stock'
import type { WarehouseStockDashboardData } from '@/types/warehouse-stock-dashboard.types'
import { WarehouseStockDashboardSkeleton } from '../skeletons/warehouse-stock-dashboard-skeleton'

export function WarehouseStockDashboardPageClient({
  warehouseId
}: {
  warehouseId: string
}) {
  const router = useRouter()
  const { data, isLoading, error } = useDashboardLocationResource<WarehouseStockDashboardData>({
    endpoint: `/dashboard/warehouses/${warehouseId}/stock`,
    fallbackError: 'Could not load warehouse stock. Please try again.'
  })

  if (isLoading) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="p-4 xl:p-6">
          <WarehouseStockDashboardSkeleton />
        </div>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 p-6 xl:p-10">
          <div
            className="w-full max-w-lg rounded-2xl px-6 py-10 text-center"
            style={{
              background: 'var(--wh-card-bg-soft)',
              border: '1px solid var(--wh-border)'
            }}
          >
            <p className="text-sm leading-relaxed" style={{ color: 'var(--wh-text-primary)' }}>
              {error ?? 'Warehouse not found.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard/locations/warehouses')}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-action-bg)',
                  border: '1px solid var(--wh-action-border)',
                  color: 'var(--wh-action-text)'
                }}
              >
                Warehouses home
              </button>
              <Link
                href={`/dashboard/locations/warehouses/${warehouseId}`}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  border: '1px solid var(--wh-border)',
                  color: 'var(--wh-text-primary)'
                }}
              >
                Back to overview
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return <DashboardWarehouseStockView data={data} />
}
