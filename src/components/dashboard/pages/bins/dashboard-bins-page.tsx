'use client'

import { binTableColumns, type BinTableRow } from '@/components/configs/entities/bin/config'
import CreateBinForm from '@/components/dashboard/features/bins/create-bin-form'
import PageWithGrid from '@/components/pages/page-with-grid'
import { useDashboardWarehouse } from '@/hooks/dashboard/use-dashboard-warehouse'

export function DashboardBinsPageView() {
  const { bins, zoneOptions, isLoading, error } = useDashboardWarehouse()

  function handleRowClick(row: BinTableRow) {
    // eslint-disable-next-line no-console
    console.log('Clicked bin row:', row)
  }

  return (
    <PageWithGrid
      title="Bins"
      headerActions={<CreateBinForm zonesList={zoneOptions} />}
      isLoading={isLoading}
      error={error}
      tableData={{ columns: binTableColumns, records: bins }}
      onRowClick={handleRowClick}
    />
  )
}
