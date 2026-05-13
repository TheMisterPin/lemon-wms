'use client'
/**
 * @generated-doc-link
 * @doc .docs/developer/refactors/components/component/dashboard/warehouses/dashboard-location-page.md
 */

import { useDashboardHome } from '@/components/features/home/use-dashboard-home'
import { BinContentsModal } from '@/components/features/locations/bins/components/bin-contents-modal'
import { useBinContentsDialog } from '@/components/features/locations/shared/hooks/use-bin-contents-dialog'

import { BinGrid } from '../components/bin-grid'
import { DirectorySections } from '../components/directory-sections'
import { OverviewCards } from '../components/overview-cards'
import { DashboardLocationsPageSkeleton } from '../skeletons/dashboard-location-page-skeleton'

/** Locations overview at `/dashboard` — aggregates only; drill down via `/dashboard/warehouses/[id]`. */
export function DashboardLocationsPageView() {
  const {
    isLoading,
    error,
    refetch,
    overviewCards,
    warehouses,
    zones,
    bins
  } = useDashboardHome()
  const contentsDialog = useBinContentsDialog()

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
        <BinGrid bins={bins.records} pageSize={bins.pageSize} onViewContents={contentsDialog.openContents} />
      </div>
      <BinContentsModal
        binId={contentsDialog.binId}
        open={contentsDialog.open}
        onOpenChange={contentsDialog.onOpenChange}
      />
    </main>
  )
}
