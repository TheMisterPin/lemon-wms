'use client'

import { useDashboardHome } from '@/components/dashboard/home/use-dashboard-home'
import { BinGrid } from './components/BinGrid'
import { COLORS } from './components/dashboard-theme'
import { DirectorySections } from './components/DirectorySections'
import { OverviewCards } from './components/OverviewCards'

export  function DashboardLocationsPageView() {
  const { overviewCards, warehouses, zones, bins } = useDashboardHome()

  return (
    <main className="min-h-screen" style={{ background: COLORS.pageBg }}>
      <div className="mx-auto max-w-7xl space-y-4 p-4 xl:space-y-5 xl:p-6">
        <OverviewCards overview={overviewCards} />
        <DirectorySections warehouses={warehouses.records} zones={zones.records} />
        <BinGrid bins={bins} />
      </div>
    </main>
  )
}
