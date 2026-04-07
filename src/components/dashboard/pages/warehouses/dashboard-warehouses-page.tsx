'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Boxes, MapPinned } from 'lucide-react'

import { warehouseTableColumns } from '@/components/configs/entities/warehouse/config'
import CreateWarehouseForm from '@/components/dashboard/features/warehouses/create-warehouse-form'
import PageWithGrid from '@/components/pages/page-with-grid'
import { ErrorModal } from '@/components/shared/ErrorModal'
import { Button } from '@/components/ui/button'
import { useDashboardWarehouse } from '@/hooks/dashboard/use-dashboard-warehouse'
import type { Warehouse } from '@/lib/schemas/warehouse'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'

export function DashboardWarehousesPageView() {
  const router = useRouter()
  const { warehouses, isLoading, error, mutationError, clearMutationError } = useDashboardWarehouse()

  function handleRowClick(row: Warehouse) {
    // eslint-disable-next-line no-console
    console.log('Clicked warehouse row:', row)
  }

  const columns = useMemo<TableColumnConfig<Warehouse>[]>(() => ([
    ...warehouseTableColumns,
    {
      label: 'Zones',
      sortable: false,
      cell: (row) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-dash-card"
          onClick={(event) => {
            event.stopPropagation()
            router.push(`/dashboard/zones?warehouseId=${encodeURIComponent(row.id)}`)
          }}
        >
          <MapPinned data-icon="inline-start" />
          View zones
        </Button>
      )
    },
    {
      label: 'Bins',
      sortable: false,
      cell: (row) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="bg-dash-card"
          onClick={(event) => {
            event.stopPropagation()
            router.push(`/dashboard/bins?warehouseId=${encodeURIComponent(row.id)}`)
          }}
        >
          <Boxes data-icon="inline-start" />
          View bins
        </Button>
      )
    }
  ]), [router])

  return (
    <>
      <PageWithGrid
        title="Warehouses"
        headerActions={<CreateWarehouseForm />}
        isLoading={isLoading}
        error={error}
        tableData={{ columns, records: warehouses }}
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
