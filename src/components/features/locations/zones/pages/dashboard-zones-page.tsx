'use client'

import CreateZoneForm from '@/components/features/locations/zones/components/create-zone-form'
import { DashboardZonesPageView } from '@/components/features/locations/zones/pages/dashboard-zones-page-view'
import { useDashboardWarehouse } from '@/hooks/dashboard/locations/use-dashboard-warehouse'

export function DashboardZonesPage() {
  const { zones, warehouseOptions, isLoading, error, actions } = useDashboardWarehouse()

  return (
    <DashboardZonesPageView
      zones={zones}
      isLoading={isLoading}
      error={error}
      headerActions={
        <CreateZoneForm
          warehouseList={warehouseOptions}
          onCreateZone={actions.createZone}
        />
      }
    />
  )
}
