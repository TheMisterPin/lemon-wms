'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/warehouse-dashboard-overview-page-client.md
 */

import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useDashboardLocationResource } from '@/components/features/locations/shared/hooks/use-dashboard-location-resource'
import { DashboardWarehouseOverviewView } from '@/components/features/locations/warehouses/pages/dashboard-warehouse-overview'
import type { WarehouseOverviewDashboardData } from '@/types/warehouse-overview-dashboard.types'
import { WarehouseDashboardOverviewSkeleton } from '../skeletons/warehouse-dashboard-overview-skeleton'

export function WarehouseDashboardOverviewPageClient({
  warehouseId
}: {
  warehouseId: string
}) {
  const router = useRouter()
  const { data, isLoading, error, reload } = useDashboardLocationResource<WarehouseOverviewDashboardData>({
    endpoint: `/dashboard/warehouses/${warehouseId}/overview`,
    fallbackError: 'Could not load warehouse overview. Please try again.'
  })

  if (isLoading) {
    return (
      <main className="min-h-screen" style={{ background: 'var(--wh-page-bg)' }}>
        <div className="mx-auto max-w-7xl p-4 xl:p-6">
          <WarehouseDashboardOverviewSkeleton />
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
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-card-bg)',
                  border: '1px solid var(--wh-border)',
                  color: 'var(--wh-text-primary)'
                }}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => void reload()}
                className="rounded-xl px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                style={{
                  background: 'var(--wh-card-bg-soft)',
                  border: '1px solid var(--wh-border)',
                  color: 'var(--wh-text-primary)'
                }}
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen" style={{ background: 'var(--wh-page-bg, #0d1117)' }}>
      <div className="mx-auto max-w-7xl p-4 xl:p-6">
        <div className="mb-4">
          <Link
            href="/dashboard/locations/warehouses"
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: 'var(--wh-text-muted)' }}
          >
            ← Warehouses home
          </Link>
        </div>
        <DashboardWarehouseOverviewView data={data} variant="embedded" />
      </div>
    </main>
  )
}
