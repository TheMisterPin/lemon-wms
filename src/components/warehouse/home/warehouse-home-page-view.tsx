'use client'

import { useRouter } from 'next/navigation'

import { BinGrid } from '@/components/features/locations/warehouses/components/bin-grid'
import { Button } from '@/components/ui/button'

import { useWarehouseHome } from './use-warehouse-home'
import { WarehouseHomeContextHeader } from './warehouse-home-context-header'
import { WarehouseHomeOrderFocus } from './warehouse-home-order-focus'
import { WarehouseHomePageSkeleton } from './warehouse-home-page-skeleton'

export function WarehouseHomePageView() {
  const router = useRouter()
  const {
    isLoading,
    error,
    refetch,
    user,
    warehouseInfo,
    focusOrder,
    activeExecutingOrder,
    summary,
    bins
  } = useWarehouseHome()

  if (isLoading) {
    return <WarehouseHomePageSkeleton />
  }

  if (error) {
    return (
      <main className="min-h-full p-4 pb-20 xl:p-6 xl:pb-20" style={{ background: 'var(--wh-page-bg)' }}>
        <div
          className="mx-auto max-w-lg rounded-xl border px-6 py-10 text-center"
          style={{ background: 'var(--wh-card-bg-soft)', borderColor: 'var(--wh-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--wh-status-blocked)' }}>{error}</p>
          <Button type="button" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main
      className="min-h-full p-4 pb-20 xl:p-6 xl:pb-20"
      style={{ background: 'var(--wh-page-bg)', color: 'var(--wh-text-primary)' }}
    >
      <div className="mx-auto max-w-7xl space-y-5">
        <WarehouseHomeContextHeader user={user} warehouseInfo={warehouseInfo} />
        <WarehouseHomeOrderFocus
          focusOrder={focusOrder}
          activeExecutingOrder={activeExecutingOrder}
          summary={summary}
        />
        <BinGrid
          bins={bins.gridRecords}
          pageSize={bins.pageSize}
          onViewContents={(binId) => router.push(`/warehouse/bins/${encodeURIComponent(binId)}`)}
        />
      </div>
    </main>
  )
}
