'use client'

import CreateBinForm from '@/components/features/locations/bins/components/create-bin-form'
import { DashboardBinsPageView } from '@/components/features/locations/bins/pages/dashboard-bins-page-view'
import { useDashboardWarehouse } from '@/hooks/dashboard/locations/use-dashboard-warehouse'

export function DashboardBinsPage() {
  const { bins, zoneOptions, isLoading, error, actions } = useDashboardWarehouse()

  return (
    <DashboardBinsPageView
      bins={bins}
      isLoading={isLoading}
      error={error}
      headerActions={
        <CreateBinForm
          zonesList={zoneOptions}
          onCreateBin={actions.createBin}
        />
      }
    />
  )
}
