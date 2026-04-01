'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Boxes, MapPinned } from 'lucide-react'

import CreateWarehouseForm from '@/app/(dashboard)/dashboard/warehouses/components/create-warehouse-form'
import PageWithGrid from '@/components/pages/page-with-grid'
import { Button } from '@/components/ui/button'
import { warehouseTableColumns } from '@/lib/components/configs/entities/warehouse/config'
import type { Warehouse } from '@/lib/components/configs/entities/warehouse/types'
import type { TableColumnConfig } from '@/types/components/table/generic-table.types'

type WarehouseApiResponse = {
  success: boolean
  data: Array<Omit<Warehouse, 'createdAt' | 'deletedAt'> & {
    createdAt: string
    deletedAt: string | null
  }>
}

export default function WarehouseDashboardPage() {
  const router = useRouter()
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    let isMounted = true

    async function loadWarehouses() {
      try {
        const response = await fetch('/api/warehouses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Failed to load warehouses.')
        }

        const payload = await response.json() as WarehouseApiResponse

        if (!isMounted) {
          return
        }

        setWarehouses(
          payload.data.map((warehouse) => ({
            ...warehouse,
            createdAt: new Date(warehouse.createdAt),
            deletedAt: warehouse.deletedAt ? new Date(warehouse.deletedAt) : null
          }))
        )
        setError(null)
      } catch {
        if (!isMounted) {
          return
        }

        setError('Unable to load warehouses.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadWarehouses()

    return () => {
      isMounted = false
    }
  }, [])

  return (

    <PageWithGrid
      title='Warehouses'
      headerActions={<CreateWarehouseForm />}
      isLoading={isLoading}
      error={error}
      tableData={{ columns, records: warehouses }}
      onRowClick={handleRowClick}
    />
  )
}
