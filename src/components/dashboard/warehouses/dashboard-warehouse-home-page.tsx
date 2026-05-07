'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/dashboard-warehouse-home-page.md
 */


import { useCallback, useState } from 'react'

import { useDashboardHome } from '@/components/dashboard/home/use-dashboard-home'

import { BinGrid } from './components/BinGrid'
import { DirectorySections } from './components/DirectorySections'
import { OverviewCards } from './components/OverviewCards'
import { DashboardLocationsPageSkeleton } from './dashboard-location-page-skeleton'
import { BinContentsModal } from '../features/bins/bin-contents-modal'

/** Aggregate warehouses / zones / bins hub at `/dashboard/warehouses` (all locations). */
export function DashboardWarehouseHomePageView() {
  const {
    isLoading,
    error,
    refetch,
    overviewCards,
    warehouses,
    zones,
    bins
  } = useDashboardHome()
  const [contentsBinId, setContentsBinId] = useState<string | null>(null)
  const [contentsOpen, setContentsOpen] = useState(false)

  const openContents = useCallback((binId: string) => {
    setContentsBinId(binId)
    setContentsOpen(true)
  }, [])

  const onContentsOpenChange = useCallback((open: boolean) => {
    setContentsOpen(open)
    if (!open) {
      setContentsBinId(null)
    }
  }, [])

  if (isLoading) {
    return <DashboardLocationsPageSkeleton />
  }

  if (error) {
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
              {error}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
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
      <div className="mx-auto max-w-7xl space-y-4 p-4 xl:space-y-5 xl:p-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--wh-text-primary)' }}>
            Warehouses
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--wh-text-muted)' }}>
            Network-wide totals, directories, and bin coverage. Open a warehouse’s command center with{' '}
            <span className="font-medium" style={{ color: 'var(--wh-text-secondary)' }}>
              See details
            </span>
            .
          </p>
        </header>
        <OverviewCards overview={overviewCards} />
        <DirectorySections
          warehouses={warehouses.records}
          zones={zones.records}
          warehousesPage={warehouses.page}
          warehousesTotalPages={warehouses.totalPages}
          onWarehousesPrev={warehouses.onPrev}
          onWarehousesNext={warehouses.onNext}
          warehousesMatchCount={warehouses.matchCount}
          zonesPage={zones.page}
          zonesTotalPages={zones.totalPages}
          onZonesPrev={zones.onPrev}
          onZonesNext={zones.onNext}
          zonesMatchCount={zones.matchCount}
        />
        <BinGrid bins={bins.records} pageSize={bins.pageSize} onViewContents={openContents} />
      </div>
      <BinContentsModal binId={contentsBinId} open={contentsOpen} onOpenChange={onContentsOpenChange} />

    </main>
  )
}
