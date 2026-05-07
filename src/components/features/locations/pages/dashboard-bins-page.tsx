'use client'

import { DashboardBinsPageView } from '@/components/dashboard/bins/DashboardBinsPageView'
import CreateBinForm from '@/components/dashboard/features/bins/create-bin-form'
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
