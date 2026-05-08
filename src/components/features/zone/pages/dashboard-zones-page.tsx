'use client'

import { DashboardZonesPageView } from '@/components/dashboard/zones/dashboard-zones-page-view'
import CreateZoneForm from '@/components/features/zone/components/create-zone-form'
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
