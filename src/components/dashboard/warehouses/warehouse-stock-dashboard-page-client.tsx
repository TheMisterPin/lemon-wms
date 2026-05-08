'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/warehouse-stock-dashboard-page-client.md
 */


import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { WarehouseStockDashboardSkeleton } from '@/components/dashboard/warehouses/components/warehouse-stock-dashboard-skeleton'
import { DashboardWarehouseStockView } from '@/components/dashboard/warehouses/dashboard-warehouse-stock'
import { dashboardApiClient } from '@/lib/axios'
import type { ApiResponse } from '@/types/responses/basic-response'
import type { WarehouseStockDashboardData } from '@/types/warehouse-stock-dashboard.types'

export function WarehouseStockDashboardPageClient({
  warehouseId
}: {
  warehouseId: string
}) {
  const router = useRouter()
  const [data, setData] = useState<WarehouseStockDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await dashboardApiClient.get<
        ApiResponse<WarehouseStockDashboardData>
      >(`/dashboard/warehouses/${warehouseId}/stock`)

      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message)
        setData(null)
      }
    } catch {
      setError('Could not load warehouse stock. Please try again.')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [warehouseId])

  useEffect(() => {
    void load()
  }, [load])

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
