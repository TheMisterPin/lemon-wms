'use client'

import { DashboardBinsPageView } from '@/components/dashboard/bins/dashboard-bins-page-view'
import CreateBinForm from '@/components/features/bin/components/create-bin-form'
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
