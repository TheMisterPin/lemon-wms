'use client'

import { useCallback, useState } from 'react'
import { useDashboardHome } from '@/components/dashboard/home/use-dashboard-home'
import { BinGrid } from './components/BinGrid'
import { DirectorySections } from './components/DirectorySections'
import { OverviewCards } from './components/OverviewCards'
import { BinContentsModal } from '../features/bins/bin-contents-modal'

export  function DashboardLocationsPageView() {
  const { overviewCards, warehouses, zones, bins } = useDashboardHome()
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
        <BinGrid bins={bins.records} pageSize={bins.pageSize} onViewContents={openContents} />
      </div>
      <BinContentsModal binId={contentsBinId} open={contentsOpen} onOpenChange={onContentsOpenChange} />

    </main>
  )
}
