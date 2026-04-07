'use client'

import { zoneTableColumns, type ZoneTableRow } from '@/components/configs/entities/zone/config'
import CreateZoneForm from '@/components/dashboard/features/zones/create-zone-form'
import PageWithGrid from '@/components/pages/page-with-grid'
import { ErrorModal } from '@/components/shared/ErrorModal'
import { useDashboardWarehouse } from '@/hooks/dashboard/use-dashboard-warehouse'

export function DashboardZonesPageView() {
  const { zones, warehouseOptions, isLoading, error, mutationError, clearMutationError } = useDashboardWarehouse()

  function handleRowClick(row: ZoneTableRow) {
    // eslint-disable-next-line no-console
    console.log('Clicked zone row:', row)
  }

  return (
    <>
      <PageWithGrid
        title="Zones"
        headerActions={<CreateZoneForm warehouseList={warehouseOptions} />}
        isLoading={isLoading}
        error={error}
        tableData={{ columns: zoneTableColumns, records: zones }}
        onRowClick={handleRowClick}
      />
      <ErrorModal
        open={mutationError !== null}
        message={mutationError?.message ?? ''}
        code={mutationError?.code}
        details={mutationError?.details}
        onClose={clearMutationError}
      />
    </>
  )
}
