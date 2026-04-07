'use client'

import { binTableColumns, type BinTableRow } from '@/components/configs/entities/bin/config'
import CreateBinForm from '@/components/dashboard/features/bins/create-bin-form'
import PageWithGrid from '@/components/pages/page-with-grid'
import { ErrorModal } from '@/components/shared/ErrorModal'
import { useDashboardWarehouse } from '@/hooks/dashboard/use-dashboard-warehouse'

export function DashboardBinsPageView() {
  const { bins, zoneOptions, isLoading, error, mutationError, clearMutationError } = useDashboardWarehouse()

  function handleRowClick(row: BinTableRow) {
    // eslint-disable-next-line no-console
    console.log('Clicked bin row:', row)
  }

  return (
    <>
      <PageWithGrid
        title="Bins"
        headerActions={<CreateBinForm zonesList={zoneOptions} />}
        isLoading={isLoading}
        error={error}
        tableData={{ columns: binTableColumns, records: bins }}
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
